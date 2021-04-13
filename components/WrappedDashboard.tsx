// this file sould be remove when node/_id is changed to tsx
import { defineComponent, PropType } from "@vue/composition-api";
import SlottedGRPC from '~/components/SlottedGRPC'
import DashboardData from '~/components/DashboardData.vue'
import type { Node } from "~/types/apiResponse";

export default defineComponent({
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true,
    },
  },
  setup: (props) => {
    return () => (
      <SlottedGRPC
        node={props.node}
        child={() => (
          <DashboardData nodeID={props.node.node_id} />
        )}
      />
    );
  },
});
