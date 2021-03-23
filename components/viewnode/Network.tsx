import {
  defineComponent,
  PropType,
  ref,
  watchEffect,
} from "@vue/composition-api";
import { VContainer, VBtn } from "vuetify/lib";
import type { Node } from "~/types/apiResponse";
import { macaroonStore } from "~/store";

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
    macaroon: {
      type: Object as PropType<ReturnType<typeof macaroonStore.macaroonState>>,
      required: true,
    },
    meta: {
      type: Object as PropType<ReturnType<typeof macaroonStore.findNodeMeta>>,
      required: true,
    },
  },
  setup: (props) => {
    const payload = ref<Record<string, any>>({});
    const responseError = ref("");

    function canFetch() {
      return (
        props.node.status === "running" &&
        props.macaroon.macaroonHex &&
        props.meta?.endpoint
      );
    }

    async function getNetworkInfo() {
      if (!canFetch()) return;

      try {
        const res = await fetch(
          `https://${props.meta?.endpoint}:8080/v1/getinfo`,
          {
            method: "GET",
            headers: new Headers({
              "Grpc-Metadata-macaroon": props.macaroon.macaroonHex,
              "Content-Type": "application/json",
            }),
          }
        );
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
      if (!props.macaroon.macaroonHex) return;
      await getNetworkInfo();
    });

    return () => {
      if (Object.keys(payload.value).length > 0) {
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
