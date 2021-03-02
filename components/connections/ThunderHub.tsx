import {
  defineComponent,
  createElement,
  PropType,
  computed,
} from "@vue/composition-api";
import type { Node } from "~/types/apiResponse";
import { macaroonStore } from "~/store";

const h = createElement;

export default defineComponent({
  components: {
    VContainer: () => import("vuetify/lib").then((m) => m.VContainer),
    CodeSnippet: () => import("~/components/core/CodeSnippet"),
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true,
    },
  },
  setup: (props) => {
    const macaroon = computed(() => {
      const data = macaroonStore.macaroonState({
        nodeId: props.node.node_id,
        type: "admin",
      });
      return data.macaroon;
    });

    const endpoint = computed(() => {
      const data = macaroonStore.findNodeMeta({ nodeId: props.node.node_id });
      return data?.endpoint || "";
    });

    const snippetText = computed(
      () => `
  masterPassword: somerandompassword
  accounts:
  - name: '${props.node.node_name}'
  serverUrl: '${endpoint.value}:10009'
  macaroon: '${macaroon.value}'
    `
    );

    return () => (
      <v-container class="text-center">
        <p class="font-weight-light text--darken-1 v-card__title justify-center align-center">
          <a href="https://thunderhub.io" target="_blank">
            ThunderHub
          </a>
        </p>
        {!props.node.settings.grpc ? (
          <div
            class="font-weight-light text--darken-1 justify-center align-center"
            max-width="800"
            style="color: #ff0000; padding: 20px;"
          >
            ThunderHub uses gRPC to communicate with your node. You have this
            API disabled in your node settings. Please enable it to connect with
            ThunderHub
          </div>
        ) : (
          <div>
            <p>
              To connect with ThunderHub, copy and paste the follow contents
              into your Account Config file.
            </p>
            <div>Account Config File:</div>
            <code-snippet>{snippetText.value}</code-snippet>
          </div>
        )}
        <a
          href="https://github.com/apotdevin/thunderhub#server-accounts"
          target="_blank"
        >
          ThunderHub Documentation.
        </a>
      </v-container>
    );
  },
});
