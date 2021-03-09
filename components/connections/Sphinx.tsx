import { defineComponent, PropType, reactive } from "@vue/composition-api";
import useNodeApi from "~/compositions/useNodeApi";
import type { Node } from "~/types/apiResponse";

export default defineComponent({
  components: {
    VContainer: () => import("vuetify/lib").then((m) => m.VContainer),
    CopyPill: () => import("~/components/core/CopyPill.vue"),
    QrcodeVue: () => import("qrcode.vue"),
    VBtn: () => import("vuetify/lib").then((m) => m.VBtn),
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true,
    },
  },
  setup: (props, ctx) => {
    const { sphinxConnString, loading } = useNodeApi(ctx.root.$nuxt.context);

    const state = reactive({
      connectionString: "",
    });

    async function getConnString() {
      const res = await sphinxConnString(props.node.node_id);
      if (res && res.data) {
        state.connectionString = res.data.connection_string;
      } else {
      }
    }
    getConnString();

    return () => (
      <v-container class="text-center">
        <p class="font-weight-light text--darken-1 v-card__title justify-center align-center">
          Sphinx
        </p>
        {state.connectionString ? (
          <div>
            <copy-pill
              class="font-weight-light"
              text={state.connectionString}
              color="accent"
              text-color="warning"
            />
            <p class="font-weight-light">click to copy</p>
            <br />
            <qrcode-vue
              value={state.connectionString}
              size="300"
              class="mx-auto"
            />
          </div>
        ) : loading.value ? (
          <div>Fetching Sphinx connection information</div>
        ) : (
          <div>
            <span>
              An error occured while fetching the Sphinx connection information
            </span>
            <br />
            <v-btn
              onClick={getConnString}
              loading={loading.value}
              color="accent"
              class="warning--text"
            >
              Retry
            </v-btn>
          </div>
        )}
      </v-container>
    );
  },
});
