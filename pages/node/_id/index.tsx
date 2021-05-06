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
    voltageFetch("/node", { method: "GET" }).then((res: any) =>
      res.json().then(({ nodes }: { nodes: Node[] }) => {
        nodeStore.HYDRATE_USER({ nodes });
      })
    );

    const route = useRoute();

    const nodeSoftware = computed(
      () => nodeStore.nodeData(route.value.params.id)?.node_type
    );

    return () => {
      console.log({ nodeSoftware });
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
