import { defineComponent, PropType, ref, computed } from "@vue/composition-api";
import type { Node } from "~/types/apiResponse";
import useBuildUri from "~/compositions/useBuildUri";
import { macaroonStore } from "~/store";
import NamedCopyPill from "~/components/core/NamedCopyPill.tsx";

export default defineComponent({
  components: {
    CopyPill: () => import("~/components/core/CopyPill.vue"),
    QrcodeVue: () => import("qrcode.vue"),
    VContainer: () => import("vuetify/lib").then((m) => m.VContainer),
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

    const macaroonHex = computed(() => {
      const data = macaroonStore.macaroonState({
        nodeId: props.node.node_id,
        type: "admin",
      });
      return data.macaroonHex;
    });

    const endpoint = computed(() => {
      const data = macaroonStore.findNodeMeta({ nodeId: props.node.node_id });
      return data?.endpoint || "";
    });

    const { uri } = useBuildUri({
      endpoint,
      macaroon,
      cert: ref(''),
      api: ref("REST"),
    });

    return () => (
      <v-container class="text-center">
        <p class="font-weight-light text--darken-1 v-card__title justify-center align-center">
          <a href="https://zeusln.app" target="_blank">
            Zeus
          </a>
        </p>
        {!props.node.settings.rest ? (
          <div
            class="font-weight-light text--darken-1 justify-center align-center"
            max-width="800"
            style="color: #ff0000; padding: 20px;"
          >
            Zeus uses the REST API to communicate with your node. You have
            this API disabled in your node settings. Please enable it to
            connect with Zeus
          </div>
        ) : (
            <div>
              <p>
                Open the Zeus app and go to the Settings. Select "Add a new
                node."
              </p>
              <p>
                You can connect by either scanning the QR code, copy/pasting the
                LNDConnect details, or copy/pasting the Endpoint and Macaroon
                individually.
              </p>
              <p>
                After your connection information is entered, select "Save Node
                Config."
              </p>
              <qrcode-vue value={uri.value} size="300" />
              <p></p>
              <copy-pill
                class="text-break"
                text={uri.value}
                color="accent"
                text-color="warning"
              ></copy-pill>
              <p class="font-weight-light">click to copy</p>
              <NamedCopyPill title="API Endpoint" value={endpoint.value} />
              <NamedCopyPill title="Port" value="8080" />
              <NamedCopyPill title="Macaroon Hex" value={macaroonHex.value} />
            </div>
          )}
        <a href="https://github.com/ZeusLN/zeus" target="_blank">
          Zeus Documentation.
        </a>
      </v-container>
    );
  },
});
