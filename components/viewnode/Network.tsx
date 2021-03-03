import {
  defineComponent,
  PropType,
  computed,
  ref,
  watchEffect,
  createElement,
} from "@vue/composition-api";
import { VContainer, VBtn } from "vuetify/lib";
import type { Node } from "~/types/apiResponse";
import { macaroonStore } from "~/store";
import { MacaroonType } from "~/utils/bakeMacaroon";

const h = createElement;

export default defineComponent({
  components: {
    NodePasswordInput: () => import("~/components/NodePasswordInput.vue"),
    JsonTable: () => import("~/components/core/JsonTable"),
    VContainer,
    VBtn,
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true,
    },
  },
  setup: (props) => {
    const adminMacaroon = computed(() =>
      macaroonStore.macaroonState({
        nodeId: props.node.node_id,
        type: MacaroonType.admin,
      })
    );

    const endpoint = computed(
      () => macaroonStore.findNodeMeta({ nodeId: props.node.node_id })?.endpoint
    );

    const payload = ref<Record<string, any>>({});
    const responseError = ref("");

    function canFetch() {
      return props.node.status === "running" && adminMacaroon.value.macaroonHex;
    }

    async function getNetworkInfo() {
      if (!canFetch()) return;

      try {
        const res = await fetch(`https://${endpoint.value}:8080/v1/getinfo`, {
          method: "GET",
          headers: new Headers({
            "Grpc-Metadata-macaroon": adminMacaroon.value.macaroonHex,
            "Content-Type": "application/json",
          }),
        });
        const json = await res.json();
        payload.value = {
          "Identity Pubkey": json.identity_pubkey,
          Alias: json.alias,
          Color: json.color,
          "Pending Channels": json.num_pending_channels,
          "Active Channels": json.num_active_channels,
          "Inactive Channels": json.num_inactive_channels,
          Peers: json.num_peers,
          "Block Height": json.block_height,
          "Synced to Chain": json.synced_to_chain,
          "Synced to Graph": json.synced_to_graph,
          URIs: json.uris,
        };
      } catch (e) {
        responseError.value = e.message;
      }
    }

    watchEffect(async () => {
      if (!adminMacaroon.value.macaroonHex) return;
      await getNetworkInfo();
    });

    function handlePassword(password: string) {
      macaroonStore.FETCH_MACAROON({
        nodeId: props.node.node_id,
        macaroonType: MacaroonType.admin,
        password,
      });
    }

    return () => {
      if (props.node.status !== "running") {
        return (
          <v-container class="text-center">
            <div>
              This not is not running. Your node must be running to retrieve
              this info
            </div>
          </v-container>
        );
      } else if (!props.node.settings.rest) {
        return (
          <v-container class="text-center">
            <div>
              This node does not have the REST api enabled. You must enable REST
              to view network information inside Voltage
            </div>
            <v-btn onClick={getNetworkInfo}>Retry</v-btn>
          </v-container>
        );
      } else if (!adminMacaroon.value.macaroonHex) {
        return (
          <node-password-input
            onDone={handlePassword}
            text={"Decrypt Macaroon"}
            error={adminMacaroon.value.error}
          />
        );
      } else if (Object.keys(payload.value).length > 0) {
        return (
          <v-container>
            <json-table data={() => payload.value} />
          </v-container>
        );
      } else if (responseError.value) {
        console.error(responseError.value);
        return (
          <v-container class="text-center">
            <div>
              Failed to fetch information from LND. Please make sure you have
              your current IP whitelisted in the node's settings
            </div>
            <v-btn onClick={getNetworkInfo}>Retry</v-btn>
          </v-container>
        );
      }
    };
  },
});
