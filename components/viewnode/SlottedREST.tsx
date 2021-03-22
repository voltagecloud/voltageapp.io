// higher oder component to handle rest reliant data
import {
  defineComponent,
  PropType,
  computed,
} from "@vue/composition-api";
import { macaroonStore } from "~/store";
import { MacaroonType } from "~/utils/bakeMacaroon";
import type { Node } from "~/types/apiResponse";
import useFetch from "~/compositions/useFetch";

export default defineComponent({
  components: {
    NodePasswordInput: () => import('~/components/NodePasswordInput.vue')
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true,
    },
    child: {
      type: Function as PropType<
        ({
          macaroon,
          meta,
        }: {
          macaroon: ReturnType<typeof macaroonStore.macaroonState>;
          meta: ReturnType<typeof macaroonStore.findNodeMeta>;
        }) => JSX.Element
      >,
      required: true,
    },
  },
  setup: (props) => {
    const adminMacaroon = computed(() =>
      macaroonStore.macaroonState({ nodeId: props.node.node_id, type: "admin" })
    );

    const nodeMeta = computed(() =>
      macaroonStore.findNodeMeta({ nodeId: props.node.node_id })
    );

    function handlePassword(password: string) {
      macaroonStore.FETCH_MACAROON({
        nodeId: props.node.node_id,
        macaroonType: MacaroonType.admin,
        password,
      });
    }

    const { dispatch: update, loading } = useFetch("/node", {
      method: "POST",
      body: JSON.stringify({ node_id: props.node.node_id }),
    });

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
            <v-btn onClick={update} loading={loading.value}>
              Retry
            </v-btn>
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
      } else {
        // render child component
        return props.child({ macaroon: adminMacaroon.value, meta: nodeMeta.value });
      }
    };
  },
});
