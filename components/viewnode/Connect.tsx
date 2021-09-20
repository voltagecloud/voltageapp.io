import {
  defineComponent,
  computed,
  PropType,
} from "@vue/composition-api";
import type { Node } from "~/types/apiResponse";
import { macaroonStore } from "~/store";
import { MacaroonType } from "~/utils/bakeMacaroon";
import MacaroonWarning from "~/components/MacaroonWarning";

export default defineComponent({
  components: {
    NodePasswordInput: () => import("~/components/NodePasswordInput.vue"),
    ShowQr: () => import("~/components/ShowQr"),
    MacaroonWarning
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
      if (props.node.macaroons.length < 1) {
        return (
          <MacaroonWarning />
        );
      } else if (!state.value.macaroon) {
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
