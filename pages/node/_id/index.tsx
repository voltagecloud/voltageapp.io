import { defineComponent, computed } from "@vue/composition-api";
import { nodeStore } from "~/store";
import { useRoute } from "@nuxtjs/composition-api";
import { NodeSoftware } from "~/types/apiResponse";
import LndNode from "~/components/LndNode.vue";
import BitcoinNode from "~/components/BitcoinNode";
import { voltageFetch } from "~/utils/fetchClient";
import type { Node } from "~/types/apiResponse";

export default defineComponent({
  setup: () => {
    const route = useRoute();

    const nodeId = route.value.params.id
    if (!nodeStore.nodeData(nodeId)) {
      nodeStore.FETCH_NODE(nodeId)
    }

    const nodeSoftware = computed(
      () => nodeStore.nodeData(route.value.params.id)?.node_type
    );

    return () => {
      if (nodeSoftware.value === NodeSoftware.lnd) {
        return <LndNode />;
      } else if (
        nodeSoftware.value === NodeSoftware.bitcoind ||
        nodeSoftware.value === NodeSoftware.btcd
      ) {
        return <BitcoinNode />;
      }
    };
  },
});
