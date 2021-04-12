import {
  defineComponent,
  PropType,
  ref,
  watch,
  computed
} from "@vue/composition-api";
import { VContainer, VBtn } from "vuetify/lib";
import type { Node } from "~/types/apiResponse";
import { macaroonStore, nodeStore } from "~/store";

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
    const nodeInfo = computed({
      get: () => {
        const id = props.node.node_id
        const payload = nodeStore.nodeInfo[id] || null
        return {
          id,
          payload
        }
      },
      set: ({ id, payload }: {id: string; payload: Record<string, any>|null}) => {
        nodeStore.NODE_INFO({ id, payload })
      }
    })

    const payload = computed<Record<string, any>>(() => ({
        "Identity Pubkey": nodeInfo.value.payload?.identity_pubkey,
        Alias: nodeInfo.value.payload?.alias,
        Color: nodeInfo.value.payload?.color,
        "Pending Channels": nodeInfo.value.payload?.num_pending_channels,
        "Active Channels": nodeInfo.value.payload?.num_active_channels,
        "Inactive Channels": nodeInfo.value.payload?.num_inactive_channels,
        Peers: nodeInfo.value.payload?.num_peers,
        "Block Height": nodeInfo.value.payload?.block_height,
        "Synced to Chain": nodeInfo.value.payload?.synced_to_chain,
        "Synced to Graph": nodeInfo.value.payload?.synced_to_graph,
        URIs: nodeInfo.value.payload?.uris,
      })
    );

    function canFetch() {
      return (
        props.node.status === "running" &&
        props.macaroon.macaroonHex &&
        props.meta?.endpoint
      );
    }

    const responseError = ref("");
    async function getNetworkInfo() {
      if (!canFetch()) return;

      try {
        const res = await fetch(
          `https://${props.meta?.endpoint}:8080/v1/getinfo`,
          {
            method: "GET",
            cache: "no-store",
            headers: new Headers({
              "Grpc-Metadata-macaroon": props.macaroon.macaroonHex,
              "Content-Type": "application/json",
            }),
          }
        );
        const json = await res.json();
        nodeInfo.value = {
          id: props.node.node_id,
          payload: json
        }
      } catch (e) {
        responseError.value = e.message;
      }
    }
    getNetworkInfo()

    watch(() => props.macaroon, async () => {
      console.log('watch trigger')
      if (!props.macaroon.macaroonHex) return;
      await getNetworkInfo();
    });

    return () => {
      if (nodeInfo.value.payload) {
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
