import {
  defineComponent,
  ref,
  PropType,
  computed
} from "@vue/composition-api";
import useBuildUri from "~/compositions/useBuildUri";
import { Node } from "~/types/apiResponse";
import { macaroonStore } from "~/store";


export default defineComponent({
  components: {
    CopyPill: () => import("~/components/core/CopyPill.vue"),
    QrcodeVue: () => import("qrcode.vue"),
    VContainer: () => import("vuetify/lib").then(m => m.VContainer)
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true
    }
  },
  setup: (props, ctx) => {
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
      cert: ref(''),
      api: ref("GRPC")
    });

    return () => (
      <v-container class="text-center">
        <p class="font-weight-light text--darken-1 v-card__title justify-center align-center">
          <a href="https://zaphq.io" target="_blank">
            Zap
          </a>
        </p>
        {!!props.node.settings.grpc ? (
          <div>
            <p>Connection String</p>
            <copy-pill
              class="text-break"
              text={uri.value}
              color="accent"
              text-color="warning"
            />
            <p class="font-weight-light">click to copy</p>
            <qrcode-vue value={uri.value} size="300" />
          </div>
        ) : (
          <div>
            <div
              class="font-weight-light text--darken-1 justify-center align-center"
              max-width="800"
              style="color: #ff0000; padding: 20px;"
            >
              Zap uses gRPC to communicate with your node. You have this API
              disabled in your node settings. Please enable it to connect with
              Zap.
            </div>
            <ul>
              <li>
                • Open the Zap app and create a new wallet. Select 'Connect'.{" "}
              </li>
              <li>
                • You can connect by either scanning the QR code below or
                copy/pasting the LNDConnect string into the 'Connection String'
                box.
              </li>
            </ul>
          </div>
        )}
        <a
          href="https://docs.zaphq.io/docs-desktop-lnd-connect"
          target="_blank"
        >
          Zap Documentation.
        </a>
      </v-container>
    );
  }
});
