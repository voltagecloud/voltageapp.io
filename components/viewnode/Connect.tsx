import {
  defineComponent,
  computed,
  createElement,
  PropType,
} from "@vue/composition-api";
import type { Node } from "~/types/apiResponse";
import { macaroonStore } from "~/store";
import { MacaroonType } from "~/utils/bakeMacaroon";

const h = createElement;

export default defineComponent({
  components: {
    NodePasswordInput: () => import("~/components/NodePasswordInput.vue"),
    ShowQr: () => import("~/components/ShowQr"),
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true,
    },
  },
  setup: (props) => {
    const state = computed(() => {
      const data = macaroonStore.macaroonState({
        nodeId: props.node.node_id,
        type: MacaroonType.admin,
      });
      return data;
    });

    async function writePassword(password: string) {
      await macaroonStore.FETCH_MACAROON({
        nodeId: props.node.node_id,
        password,
        macaroonType: MacaroonType.admin,
      });
    }

    return () => {
      if (!state.value.macaroon) {
        return (
          <node-password-input
            text="Connect"
            onDone={writePassword}
            error={state.value.error}
          />
        );
      } else {
        return <show-qr node={props.node} />;
      }
    };
  },
});
