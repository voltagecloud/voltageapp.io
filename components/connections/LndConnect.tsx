import {
  defineComponent,
  createElement,
  PropType,
  ref,
  computed
} from "@vue/composition-api";
import { Node } from "~/types/apiResponse";
import useBuildUri, { selectedApi } from "~/compositions/useBuildUri";
import { macaroonStore } from "~/store";

const h = createElement;

export default defineComponent({
  components: {
    BaseConnect: () => import("./BaseConnect"),
    ApiToggle: () => import("./ApiToggle"),
    CertToggle: () => import("./CertToggle"),
    VContainer: () => import("vuetify/lib").then(m => m.VContainer),
    VRow: () => import("vuetify/lib").then(m => m.VRow),
    VCol: () => import("vuetify/lib").then(m => m.VCol),
    VSpacer: () => import("vuetify/lib").then(m => m.VSpacer),
    VRadioGroup: () => import("vuetify/lib").then(m => m.VRadioGroup),
    VCheckbox: () => import("vuetify/lib").then(m => m.VCheckbox)
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true
    }
  },
  setup: props => {
    const macaroon = computed(() => {
      const data = macaroonStore.macaroonState({
        nodeId: props.node.node_id,
        type: "admin"
      });
      return data.macaroon;
    });

    const endpoint = computed(() => {
      const data = macaroonStore.findNodeMeta({ nodeId: props.node.node_id });
      return data?.endpoint || "";
    });

    const { uri } = useBuildUri({
      endpoint,
      macaroon,
      cert: ref(false),
      api: selectedApi
    });

    return () => {
      return (
        <div>
          <p class="font-weight-light text--darken-1 v-card__title justify-center align-center">
            LNDConnect
          </p>
          <base-connect connectUri={uri.value} node={props.node} />
          <v-container class="d-flex flex-column align-center">
            <api-toggle
              value={selectedApi.value}
              onInput={(val: "GRPC" | "REST") => {
                selectedApi.value = val;
              }}
              node={props.node}
            />
          </v-container>
        </div>
      );
    };
  }
});
