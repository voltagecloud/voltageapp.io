import { defineComponent, PropType } from "@vue/composition-api";
import type { Node } from "~/types/apiResponse";

export default defineComponent({
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true,
    },
    child: {
      type: Function as PropType<() => JSX.Element>,
      required: true,
    },
  },
  setup: (props) => {
    return () => {
      if (props.node.status !== "running") {
        return (
          <div class="ma-3 text-center">
            This feature requires your node to be running. Make sure the node is
            running then try again.
          </div>
        );
      } else if (props.node.settings?.grpc) {
        return props.child();
      }
      return (
        <div class="ma-3 text-center">
          This feature requires GRPC to be enabled in node settings. Please
          enable GRPC and try again.
        </div>
      );
    };
  },
});
