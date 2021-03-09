<template>
  <v-container>
    <v-container v-if="showTrialBox" color="primary">
      <v-dialog
        max-width="800"
        color="secondary"
        :value="showTrialBox"
        @click:outside="clear"
      >
        <v-card class="text-center" style="padding: 20px" color="info">
          <v-card-title>Welcome to Voltage!</v-card-title>
          <v-container>
            <v-row justify="center">
              <v-col cols="12">
                <p style="font-size: 24px">Create a Node</p>
                <p
                  style="padding-left: 5px; padding-right: 5px; font-size: 15px"
                >
                  Create your free trial node now. These trial nodes last for 7
                  days and are provisioned on Bitcoin's testnet.
                </p>
                <v-form
                  ref="form"
                  v-model="valid"
                  lazy-validation="lazy-validation"
                  @submit.prevent="populate"
                >
                  <v-col cols="12" style="max-width: 100%">
                    <v-card-title
                      class="font-weight-light warning--text text--darken-1 v-card--title"
                      >Choose Name</v-card-title
                    >
                    <div style="padding-left: 5px; padding-right: 5px">
                      <v-text-field
                        v-model="nodeName"
                        label="Node Name"
                        outlined="outlined"
                        color="highlight"
                        background-color="secondary"
                        :error-messages="errorMessage"
                        :rules="[required]"
                        @blur="validateName"
                        required="required"
                      ></v-text-field>
                    </div>
                  </v-col>
                  <v-col cols="12" style="max-width: 100%">
                    <v-card-title
                      class="font-weight-light warning--text text--darken-1 v-card--title"
                      >Choose Password</v-card-title
                    >
                    <div justify="center" align="center" style="margin: auto">
                      <p
                        class="warning--text text--darken-1"
                        style="padding-left: 5px"
                      >
                        Create a password for your node
                      </p>
                    </div>
                    <div style="padding: 5px">
                      <v-form v-model="valid" ref="form">
                        <v-text-field
                          v-model="password"
                          :rules="[required]"
                          label="Password"
                          color="highlight"
                          background-color="secondary"
                          outlined="outlined"
                          :append-icon="
                            showPassword ? 'mdi-eye' : 'mdi-eye-off'
                          "
                          :type="showPassword ? 'text' : 'password'"
                          required="required"
                          @click:append="showPassword = !showPassword"
                        ></v-text-field>
                        <v-text-field
                          v-model="confirmPassword"
                          :rules="[char8, matchPassword, required]"
                          :type="showPassword ? 'text' : 'password'"
                          label="Confirm Password"
                          color="highlight"
                          background-color="secondary"
                          outlined="outlined"
                          :error-messages="error"
                          required="required"
                        ></v-text-field>
                        <div class="text-center warning--text mb-6">
                          <v-icon style="padding-bottom: 10px"
                            >mdi-alert-circle</v-icon
                          ><br />Write this password down! You need it to unlock
                          your node. Also your node's seed and macaroons are
                          encrypted to this password. Losing this password means
                          losing access to backups and Voltage can not reset it.
                        </div>
                        <v-divider class="mx-12 mt-6"></v-divider>
                      </v-form>
                    </div>
                  </v-col>
                  <div justify="center" align="center" style="margin: auto">
                    <v-row justify="center" style="max-width: 75%">
                      <v-col class="pt-0" cols="12">
                        <p class="px-4 error--text" v-if="populateError">
                          There was a problem configuring the node. Please retry
                          or create a new one.
                        </p>
                      </v-col>
                      <v-col class="pt-0" cols="12">
                        <v-btn
                          class="px-4 warning--text"
                          block=""
                          type="submit"
                          color="secondary"
                          large=""
                          :loading="loading"
                          :disabled="!valid"
                          >Provision Node<br
                        /></v-btn>
                        <div
                          class="text-center warning--text mb-6"
                          style="padding-top: 15px"
                        >
                          Please do not close your browser until your node is
                          running.
                        </div>
                      </v-col>
                    </v-row>
                  </div>
                </v-form>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-dialog>
    </v-container>
    <v-row justify="center" align="center" no-gutters="no-gutters">
        <template v-if="display && nodes.length">
          <VirtualScroll :items="nodes" :height="120" :renderAhead='1'>
            <template v-slot:default="{ items }">
              <div v-for="(node, i) in items" :key="`${node.node_id}_${i}`">
                <v-col cols="12" md="10" lg="8" class="mx-auto">
                  <node-controls :nodeID="node.node_id" />
                </v-col>
              </div>
            </template>
          </VirtualScroll>
        </template>
      <v-col cols="12" md="8" v-else>
        <v-card key="no-nodes" color="info">
          <v-card-title
            class="justify-center text-h5"
            style="word-break: normal"
          >
            <div class="text-center">
              Welcome to Voltage! Let's get started.
            </div>
          </v-card-title>
          <v-card-text class="text-center">
            <div>
              Voltage offers products that make using Bitcoin and the Lightning
              Network easy. Get started on Mainnet or Testnest in just a few
              clicks.
            </div>
          </v-card-text>
          <v-card-text class="mt-6 text-center font-weight-bold text-h6">
            <div>What would you like to create?</div>
          </v-card-text>
          <v-card-actions class="text-center">
            <v-container>
              <v-row>
                <v-col
                  v-for="(product, i) in products"
                  :key="i"
                  cols="12"
                  sm="6"
                >
                  <v-card
                    @click="$router.push(product.to)"
                    class="text-center d-flex flex-column justify-space-between"
                    style="height: 200px"
                  >
                    <v-img
                      :src="product.src"
                      max-height="150"
                      max-width="150"
                      class="mx-auto my-3"
                      contain
                    />
                    <div class="font-weight-bold">{{ product.title }}</div>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { defineComponent, computed, ref } from "@vue/composition-api";
import { Address4 } from "ip-address";
import { layoutStore, nodeStore, createStore } from "~/store";
import useFormValidation from "~/compositions/useFormValidation";
import useNodeApi from "~/compositions/useNodeApi";
import useFetch from "~/compositions/useFetch";

import { Network } from "~/types/api";

export default defineComponent({
  middleware: ["loadCognito", "assertAuthed", "loadUser"],
  components: {
    AvailableNode: () => import("~/components/AvailableNode.vue"),
    NodeControls: () => import("~/components/viewnode/NodeControls.vue"),
    VirtualScroll: () => import("~/components/core/VirtualScroll.vue"),
  },
  setup(_, { root }) {
    const {
      valid,
      settings,
      required,
      char8,
      matchPassword,
      confirmPassword,
      password,
      showPassword,
    } = useFormValidation();
    const {
      populateNode,
      createNode,
      loading,
      nodeName: checkNodeName,
    } = useNodeApi(root.$nuxt.context);

    const populateError = ref(false);

    const nodeName = computed({
      get: () => createStore.nodeName,
      set: (v: string) => createStore.NODE_NAME(v),
    });

    const errorMessage = ref("");
    const error = ref("");

    layoutStore.SET_TITLE("Dashboard");
    layoutStore.DRAWER(null);

    const nodes = computed(() => nodeStore.IDNames);

    const display = computed(() => !!nodeStore.user);

    const noNodes = computed(() => nodes.value.length === 0 && display.value);

    const showTrialBox = computed(() => nodeStore.showTrialBox);

    const ip = ref("");

    async function create() {
      if (showTrialBox.value) {
        try {
          createStore.NODE_TYPE({
            network: Network.testnet,
            trial: true,
            type: "trial",
          });
          const node = await createNode();
          ip.value = node.data.user_ip;
        } catch (e) {
          populateError.value = true;
          throw new Error(e);
        }
      }
    }
    create();

    function clear() {
      nodeStore.SET_SHOWED_TRIAL(true);
    }

    async function populate() {
      if (nodeName.value === "") {
        errorMessage.value = "You must specify a node name.";
        return;
      }
      if (password.value === "") {
        error.value = "You must create a password.";
        return;
      }
      settings.alias = nodeName.value;
      settings.color = "#EF820D";
      settings.whitelist = [(ip.value as unknown) as Address4];
      settings.webhook = "";
      settings.autopilot = false;
      settings.grpc = true;
      settings.rest = true;
      settings.keysend = true;
      settings.wumbo = true;
      settings.minchansize = "";
      settings.maxchansize = "";
      settings.autocompaction = false;
      settings.defaultfeerate = "";
      createStore.SETTINGS(settings);
      createStore.PASSWORD(password.value);
      try {
        await populateNode();
        nodeStore.SET_SHOWED_TRIAL(true);
        root.$router.push(`/node/${createStore.newNodeID}`);
      } catch (e) {
        console.log(e);
        populateError.value = true;
      }
    }

    async function validateName() {
      if (!nodeName.value) {
        return;
      }
      const res = await checkNodeName(nodeName.value, createStore.network);
      if (res.data.taken) {
        errorMessage.value = "Node name is already taken";
      } else if (!res.data.valid) {
        errorMessage.value =
          "Invalid node name. Must be only letters, numbers, and dashes with less than 42 characters.";
      } else {
        errorMessage.value = "";
      }
    }

    const { data, dispatch } = useFetch<any>("/user");
    dispatch({ method: "GET" });

    const products = computed(() => [
      {
        title: "Lightning Node",
        src: require("~/assets/lnd-logo.png"),
        to: "/create/lnd",
      },
      {
        title: "BTCPay Server",
        src: require("~/assets/btcpay-logo.svg"),
        to: data.value?.btcpayservers ? "/btcpay" : "/create/btcpay",
      },
    ]);

    return {
      display,
      noNodes,
      showTrialBox,
      validateName,
      populate,
      error,
      errorMessage,
      populateError,
      required,
      password,
      valid,
      loading,
      confirmPassword,
      showPassword,
      matchPassword,
      char8,
      nodeName,
      clear,
      nodes,
      products,
    };
  },
});
</script>
