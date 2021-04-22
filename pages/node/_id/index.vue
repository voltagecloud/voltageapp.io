<template lang="pug">
v-container
  v-row
    v-col
      v-fade-transition
        node-controls(:nodeID='nodeID' @event='$fetch')
          template(v-slot:prepend-content)
            v-tabs(v-model='curTab' background-color='transparent' grow show-arrows)
              v-tab(
                v-for='tab in tabs'
                :key='tab'
                active-class='highlight'
                @click='() => { if (tab === "Logs" && !!logsRef) { logsRef.getLogs() }}'
              ) {{tab}}
            v-divider
          template(v-slot:append-content v-if='nodeData && nodeData.node_name')
            v-divider
            p(v-if="helperText").font-weight-light.warning--text.text--darken-1.v-card--title(justify='center' align='center' style='padding-top: 15px; margin: auto;')
              | {{ helperText }}
            //- Unlock button
            v-container(v-if='canUnlock')
              core-dialog(:value='false' useActivator activatorText='Unlock Node')
                node-password-input(
                  @done='unlockNode'
                  text='Unlock Node'
                  :error='error'
                  :loading='unlocking'
                )
            //- Update button
            v-container(v-if='canUpdate' @click='confirmUpdate = true')
              v-btn(color='highlight' block).info--text Update Available
              v-dialog(v-model='confirmUpdate' max-width='800')
                v-card
                  v-card-text.pt-3.font-weight-light.warning--text.text--darken-1
                    | Updating requires a restart of your node. Are you sure you want update this node?
                  v-card-actions
                    v-btn(color='info' @click='closeAndUpdate') Yes
                    v-btn(@click='confirmUpdate = false') No
            v-tabs-items(
              v-model='curTab'
              :style='{"background-color": $vuetify.theme.currentTheme.secondary}'
            )
              //- node data table tab
              v-tab-item
                data-table(:node='nodeData')
                v-container
                  core-dialog(v-if='status !== "provisioning"' useActivator :value='false' activatorText='Export Data')
                    export-data(:nodeID='nodeID' :nodeStatus='status')
              v-tab-item
                WrappedNetwork(:node='nodeData')
              v-tab-item
                connect-tab(:node='nodeData')
              v-tab-item
                WrappedDashboard(:node='nodeData')
              v-tab-item
                node-settings(v-if='nodeData.settings' :node='nodeData' @updated='() => { $fetch(); curTab = 0; }')
              v-tab-item
                logs(ref='logsRef' :nodeId='$route.params.id')
              v-tab-item(class="text-center")
                WrappedPodcast(:node='nodeData')
            v-container(v-if='errorText !== ""')
              v-card-text.error--text.text--darken-1(style='font-size: 16px;')
                | {{ errorText }}
            //- v-container(v-if='status === "running"')
              v-btn(color='highlight' block @click='connect').info--text Connect
            v-container(v-if='status === "waiting_init"')
              v-btn(color='highlight' block @click='nodeCreating = true').info--text Initialize
            v-container(v-if='nodeCreating' color='primary')
              v-dialog(max-width='800' color='secondary' :value='showPodcastCompletion')
                v-container(class="text-center d-flex flex-column")
                  div Your Breez Channel has been opened. You are free to close this page
                  v-btn(class="mt-3" block @click="() => showPodcastCompletion = false" color="highlight" dark) Continue

              v-dialog(max-width='800' color='secondary' :value='nodeCreating')
                v-card.text-center(style='padding: 20px;' :loading='nodeCreating && status !== "running"')
                  v-card-title Node is being created
                  v-container
                    v-row(justify='center')
                      v-col(v-if="status !== 'running'" cols='12')
                        p
                          | Please wait while your node is creating. This can take up to a couple of minutes. Please do not close your browser until the node is running.
                        p(style='font-family: monospace')
                          | Current stage: {{ createText }}
                      v-col(v-else cols="12")
                        div(class="d-flex flex-column align-center")
                          div(class="font-weight-bold") Your node is ready to use!
                          div You can start using your node by connecting your favorite Lightning app.
                          div(v-if='tabs.includes("Podcast")')
                            | Your node must sync to the blockchain before creating a channel with Breez.
                            | Please leave your browser open until the chain is synced.
                          v-btn(class="mt-3" block @click="confirmReady" color="highlight" dark) Continue
                    v-container(v-if='passwordInit && status === "waiting_init"')
                      div(v-if='passwordInit')
                        div(justify='center' align='center' style='margin: auto;')
                          p(style="padding-left: 5px;").warning--text.text--darken-1
                            | Create a password for your node
                        div(style='padding: 20px;')
                          v-form(v-model='valid' ref='form')
                            v-text-field(
                              v-model='password'
                              :rules='[required]'
                              label='Password'
                              color='highlight'
                              background-color='secondary'
                              outlined
                              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                              :type="showPassword ? 'text' : 'password'"
                              required
                              @click:append='showPassword = !showPassword'
                            )
                            v-text-field(
                              v-model='confirmPassword'
                              :rules='[char8, matchPassword, required]'
                              :type="showPassword ? 'text' : 'password'"
                              label='Confirm Password'
                              color='highlight'
                              background-color='secondary'
                              outlined
                              :error-messages='passError'
                              required
                            )
                            br
                            div.text-center.warning--text.mb-6
                              v-icon(style='padding-bottom: 10px;') mdi-alert-circle
                              br
                              | Write this password down! You need it to unlock your node and your node's seed and macaroons are encrypted to this password. Losing this password means losing access to backups and Voltage can not reset it.
                            v-divider.mx-12.mt-6
                      v-btn(color='highlight' block @click='initialize' :loading='initializing').info--text Initialize

</template>
<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  watch,
  watchEffect,
} from "@vue/composition-api";
import { useRoute } from "@nuxtjs/composition-api";
import axios from "axios";
import crypto from "crypto-js";
import { nodeStore, lndStore, createStore, dashboardsStore } from "~/store";
import useNodeStatus from "~/compositions/useNodeStatus";
import useNodeApi from "~/compositions/useNodeApi";
import useFormValidation from "~/compositions/useFormValidation";
import type { Node } from "~/types/apiResponse";
import type LogsComponent from "~/components/viewnode/Logs.vue";
import WrappedNetwork from "~/components/viewnode/WrappedNetwork";
import WrappedPodcast from "~/components/viewnode/WrappedPodcast";
import WrappedDashboard from "~/components/WrappedDashboard";
import { macaroonStore } from "~/store";
import { MacaroonType } from "~/utils/bakeMacaroon";
import { voltageFetch } from "~/utils/fetchClient";
import { NodeStatus } from "~/types/api";
import { Product } from "~/utils/voltageProducts";

export default defineComponent({
  components: {
    NodeControls: () => import("~/components/viewnode/NodeControls.vue"),
    DataTable: () => import("~/components/viewnode/DataTable.vue"),
    NodeSettings: () => import("~/components/viewnode/NodeSettings.vue"),
    ExportData: () => import("~/components/ExportData.vue"),
    WrappedDashboard,
    WrappedNetwork,
    WrappedPodcast,
    ConnectTab: () => import("~/components/viewnode/Connect"),
    Logs: () => import("~/components/viewnode/Logs.vue"),
    CoreDialog: () => import("~/components/core/Dialog.vue"),
    NodePasswordInput: () => import("~/components/NodePasswordInput.vue"),
    CopyPill: () => import("~/components/core/CopyPill.vue"),
    QrcodeVue: () => import("qrcode.vue"),
  },
  async fetch() {
    // @ts-ignore
    const axios = this.$nuxt.context.$axios;
    // @ts-ignore
    const res = await axios.get("/dashboards");
    dashboardsStore.DASHBOARDS(res.data.dashboards);
    // @ts-ignore
    const { postNode } = useNodeApi(this.$nuxt.context);
    // @ts-ignore
    postNode(this.nodeID);
    // Logic for auto-refreshing
    // make sure interval is clean
    // set new interval
    let firstRun = true;
    // @ts-ignore
    this.timer = setInterval(async () => {
      // @ts-ignore
      let previousStatus = this.status;
      if (!firstRun) {
        // If the node was running, deleted, or stopped on load don't try to refresh
        if (
          previousStatus === "running" ||
          previousStatus === "stopped" ||
          previousStatus === "deleted"
        ) {
          // @ts-ignore
          clearInterval(this.timer);
          return;
        }
      }
      // @ts-ignore
      const { postNode } = useNodeApi(this.$nuxt.context);
      // @ts-ignore
      const res = await postNode(this.nodeID);
      // @ts-ignore
      const shouldRefresh = previousStatus === res.status;
      // @ts-ignore
      previousStatus = res.status;
      // If the user leaves the node's page stop checking
      // @ts-ignore
      if (this.$route.params.id !== res.node_id) {
        // @ts-ignore
        clearInterval(this.timer);
        return;
      }
      if (!shouldRefresh) {
        // If the node is in a running, deleted, or stopped state we want to stop checking
        if (
          previousStatus === "running" ||
          previousStatus === "stopped" ||
          previousStatus === "deleted"
        ) {
          // @ts-ignore
          clearInterval(this.timer);
        }
      }
      firstRun = false;
    }, 5000);
  },
  setup(_, ctx) {
    const route = useRoute();
    const nodeID = ref(ctx.root.$nuxt.context.params.id);
    const nodeData = computed(
      () => nodeStore.nodes.filter((elem) => elem.node_id === nodeID.value)[0]
    );
    const { canInit, canUnlock, canUpdate, status, helperText } = useNodeStatus(
      nodeData
    );
    const { updateNode, updateStatus, postNode } = useNodeApi(
      ctx.root.$nuxt.context
    );
    const timer = ref<NodeJS.Timeout | null>(null);
    const errorText = ref("");
    const initializing = ref(false);
    const initPassword = ref("");
    const passError = ref("");
    const nodeCreating = ref(false);
    const createText = ref("");
    const passwordInit = computed(() => {
      if (createStore.password) {
        return false;
      } else {
        return true;
      }
    });

    function sleep(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // get handle to macaroon state for this node
    const macaroonHex = computed(
      () =>
        macaroonStore.macaroonState({
          nodeId: route.value.params.id,
          type: MacaroonType.admin,
        })?.macaroonHex
    );
    // get handle to node password for this node
    const nodePw = computed(() =>
      macaroonStore.password({
        nodeId: route.value.params.id,
      })?.password
    );

    async function initialize() {
      lndStore.CURRENT_NODE(nodeData.value);
      initializing.value = true;
      if (createStore.password) {
        initPassword.value = createStore.password;
      } else {
        if (nodePassword.value === "") {
          passError.value = "You must create a password.";
          initializing.value = false;
          return;
        }
        if (nodePassword.value.length < 8) {
          passError.value = "Password must be at least 8 characters.";
          initializing.value = false;
          return;
        }
        initPassword.value = nodePassword.value;
      }
      createText.value = "initializing";
      const node = lndStore.currentNode as Node;
      updateStatus(node.node_id, "initializing");
      try {
        const seed = await axios({
          url: `https://${node.api_endpoint}:8080/v1/genseed`,
          method: "GET",
        });
        const res = await axios({
          method: "POST",
          url: `https://${node.api_endpoint}:8080/v1/initwallet`,
          data: {
            wallet_password: btoa(initPassword.value), // b64 encode password string
            cipher_seed_mnemonic: seed.data.cipher_seed_mnemonic,
            stateless_init: true,
          },
        });
        createText.value = "encrypting data";
        if (node.macaroon_backup) {
          const encryptedMacaroon = crypto.AES.encrypt(
            res.data.admin_macaroon,
            initPassword.value
          ).toString();
          const encryptedSeed = crypto.AES.encrypt(
            btoa(seed.data.cipher_seed_mnemonic.join(",")),
            initPassword.value
          ).toString();
          await voltageFetch("/node/macaroon", {
            method: "POST",
            body: JSON.stringify({
              node_id: route.value.params.id,
              name: "admin",
              macaroon: encryptedMacaroon,
            }),
          });
          await voltageFetch("/node/seed", {
            method: "POST",
            body: JSON.stringify({
              node_id: route.value.params.id,
              seed: encryptedSeed,
            }),
          });
          // write the macaroon to macaroon store
          await macaroonStore.FETCH_MACAROON({
            nodeId: route.value.params.id,
            macaroonType: "admin",
            password: initPassword.value,
          });
        }
        res.data = {};
        seed.data = {};
        await sleep(4000);
        createText.value = "finalizing";
      } catch (err) {
        updateStatus(node.node_id, "waiting_init");
        nodeCreating.value = false;
        errorText.value = err;
        console.log(err);
        initializing.value = false;
      }
    }

    const {
      valid,
      settings,
      required,
      form,
      validIP,
      remove,
      showPalette,
      invertColor,
      char8,
      matchPassword,
      confirmPassword,
      password: nodePassword,
      showPassword,
    } = useFormValidation();

    const unlockDialog = ref(false);
    const unlocking = ref(false);
    const error = ref("");

    async function unlockSphinx(password: string) {
      console.log({ password })
      const api = nodeData.value.api_endpoint.replace(
        "voltageapp.io",
        "relay.voltageapp.io"
      );
      // call to unlock sphinx
      await fetch(`https://${api}:3001/unlock`, {
        method: "POST",
        body: JSON.stringify({ password }),
      });
    }

    // unlocks the current node via fetch request
    async function unlockNode(password: string) {
      error.value = "";
      unlocking.value = true;
      const endpoint = nodeData.value?.api_endpoint;
      if (!endpoint) {
        error.value = "Error getting node data. please try again later";
        return;
      }

      try {
        const res = await fetch(`https://${endpoint}:8080/v1/unlockwallet`, {
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({
            wallet_password: btoa(password),
            stateless_init: true,
          }),
        });
        if (!res.ok) {
          error.value = "An error occurred unlocking node. Try again later.";
          return;
        }
        // password is correct, safe to write to store
        macaroonStore.NODE_PASSWORD({
          nodeId: route.value.params.id,
          password,
        });

        // update the status of the node in the api
        await updateStatus(route.value.params.id, "unlocking");
        // check if sphinx relay needs to be unlocked
        if (nodeData.value.settings.sphinx) {
          console.log({ NODE_PASSWORD: password })
          await unlockSphinx(password);
        }
        await postNode(nodeID.value);
      } catch (e) {
        error.value =
          "There was a problem communicating with the node please try again later";
        return;
      } finally {
        unlocking.value = false;
      }
    }

    async function update() {
      await updateNode(route.value.params.id);
      // @ts-ignore
      ctx.root.$nuxt.$router.go();
    }

    const showPodcastCompletion = ref(false);
    async function verifyPodcastReferral() {
      createStore.DESERIALIZE();
      if (
        createStore.planState.nodeType === Product.podcast &&
        createStore.nodeId === route.value.params.id
      ) {
        // get pubkey from getinfo call
        const pubkey = await checkChainSyncStatus();

        // unlock sphinx
        const nodePwObj = macaroonStore.password({
          nodeId: route.value.params.id,
        });
        console.log({ nodePwObj })
        if (nodePwObj) {
          await unlockSphinx(nodePwObj.password);
        }

        // send custom podcast request
        const res = await voltageFetch("/_custom/podcast", {
          method: "POST",
          body: JSON.stringify({
            pubkey,
            podcast_id: createStore.referralCode,
            URI: nodeData.value.api_endpoint,
          }),
        });
        // we are now done with create store data and it should be cleared
        if (res.ok) {
          showPodcastCompletion.value = true;
          createStore.COMPLETE();
          localStorage.removeItem("podcast_id");
        }
      } else if (createStore.nodeId === route.value.params.id) {
        // this node was just created but is not a podcast node
        // clear its store state
        createStore.COMPLETE();
      }
    }

    // recursively check chain sync status and return pubkey when synced
    async function checkChainSyncStatus(): Promise<string> {
      await (() => new Promise((resolve) => setTimeout(resolve, 5000)))();
      const info = await fetch(
        `https://${nodeData.value.api_endpoint}:8080/v1/getinfo`,
        {
          method: "GET",
          cache: "no-store",
          headers: new Headers({
            "Grpc-Metadata-macaroon": macaroonHex.value,
            "Content-Type": "application/json",
            pragma: "no-cache",
            "cache-control": "no-store",
          }),
        }
      );
      if (!info.ok) {
        return await checkChainSyncStatus();
      }
      const data = await info.json();
      // write /getinfo to cache
      nodeStore.NODE_INFO({
        id: route.value.params.id,
        payload: data,
      });
      if (data.synced_to_chain) {
        return data.identity_pubkey as string;
      } else {
        // sleep for 5 secs
        return await checkChainSyncStatus();
      }
    }

    watch([nodeData, macaroonHex], async () => {
      if (
        nodeData.value &&
        nodeData.value.status === "running" &&
        macaroonHex.value
      ) {
        await verifyPodcastReferral();
      }
    });

    // clear errors on typing in password field
    watch(nodePassword, () => {
      error.value = "";
    });
    watch(nodePassword, () => {
      passError.value = "";
    });
    watch(
      status,
      (newStatus: string | NodeStatus, prev: string | NodeStatus) => {
        if (
          newStatus === NodeStatus.initializing ||
          newStatus === NodeStatus.provisioning
        ) {
          nodeCreating.value = true;
          createText.value = newStatus;
        }
        if (newStatus === NodeStatus.waiting_init) {
          nodeCreating.value = true;
          createText.value = "waiting_init";
          initialize();
        }
        if (newStatus === NodeStatus.running) {
          createText.value = "complete";
        }
      }
    );

    const confirmUpdate = ref(false);
    async function closeAndUpdate() {
      confirmUpdate.value = false;
      await update();
    }

    // data for tab state
    const tabs = computed(() => {
      const tabs = [
        "Info",
        "Network",
        "Connect",
        "Dashboards",
        "Settings",
        "Logs",
      ];
      const roles = nodeData.value?.custom_roles || [];
      if (roles && roles.includes("podcast")) {
        tabs.push("Podcast");
      }
      return tabs;
    });

    const curTab = ref(0);

    // only load logs on tab click
    const logsRef = ref<null | typeof LogsComponent>(null);

    // confirm ready feature
    function confirmReady() {
      nodeCreating.value = false;
      curTab.value = 2;
    }

    return {
      nodeData,
      nodeID,
      status,
      canInit,
      canUnlock,
      canUpdate,
      initialize,
      update,
      initializing,
      unlocking,
      unlockNode,
      passwordInit,
      char8,
      valid,
      form,
      nodePassword,
      unlockDialog,
      timer,
      error,
      confirmUpdate,
      closeAndUpdate,
      errorText,
      settings,
      required,
      validIP,
      remove,
      showPalette,
      invertColor,
      matchPassword,
      confirmPassword,
      password: nodePassword,
      showPassword,
      passError,
      helperText,
      nodeCreating,
      createText,
      tabs,
      curTab,
      logsRef,
      confirmReady,
      showPodcastCompletion,
    };
  },
});
</script>
