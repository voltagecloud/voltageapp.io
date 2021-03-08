import {
  defineComponent,
  PropType,
  ref,
  computed,
} from "@vue/composition-api";
import type { Node } from "~/types/apiResponse";
import useBuildUri from "~/compositions/useBuildUri";
import { macaroonStore } from "~/store";


export default defineComponent({
  components: {
    CopyPill: () => import("~/components/core/CopyPill.vue"),
    CodeSnippet: () => import("~/components/core/CodeSnippet"),
    QrcodeVue: () => import("qrcode.vue"),
    VContainer: () => import("vuetify/lib").then((m) => m.VContainer),
    VBtn: () => import("vuetify/lib").then((m) => m.VBtn),
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

    const cert = computed(() => {
      const data = macaroonStore.findNodeMeta({ nodeId: props.node.node_id });
      return data?.endpoint || "";
    });

    const { uri } = useBuildUri({
      endpoint,
      macaroon,
      cert: ref(false),
      api: ref("GRPC"),
    });

    const certValid = computed(() => cert.value && cert.value !== "pending");
    const certButtonText = computed(() =>
      certValid.value ? "Download Certificate" : "Certificate is Pending"
    );

    const snippetText = computed(
      () => `
  lncli
  --rpcserver=${endpoint.value}:10009 \\
  --macaroonpath=/path/to/admin.macaroon \\
  --tlscertpath=/path/to/tls.cert \\
  getinfo
    `
    );

    return () => (
      <v-container class="text-center">
        <p class="font-weight-light text--darken-1 v-card__title justify-center align-center">
          <a href="https://github.com/lightningnetwork/lnd" target="_blank">
            lncli
          </a>
        </p>
        {!props.node.settings.grpc ? (
          <div
            class="font-weight-light text--darken-1 justify-center align-center"
            max-width="800"
            style="color: #ff0000; padding: 20px;"
          >
            lncli uses gRPC to communicate with your node. You have this API
            disabled in your node settings. Please enable it to connect with
            lncli.
          </div>
        ) : (
          <div>
            <p>
              To connect using lncli, you must download your macaroon and TLS
              certificate below. After you have downloaded the necessary files,
              simply point your CLI to their location.
            </p>
            <div>Command Line:</div>
            <code-snippet>{snippetText.value}</code-snippet>
            <div>RPC Server</div>
            <copy-pill
              class="text-break"
              text={`${endpoint.value}:10009`}
              color="accent"
              text-color="warning"
            ></copy-pill>
            <p class="font-weight-light">click to copy</p>
            <div>Macaroon</div>
            <v-btn
              class="info--text"
              color="warning"
              text-color="highlight"
              href={`data:application/text-plain;base64,${macaroon.value}`}
              download="admin.macaroon"
              title="admin.macaroon"
            >
              Download Macaroon
            </v-btn>
            <div>TLS Certificate</div>
            <v-btn
              class="info--text"
              color="warning"
              href={`data:application/text-plain;base64,${cert.value}`}
              download="tls.cert"
              title="tls.cert"
              disabled={!certValid.value}
            >
              {certButtonText.value}
            </v-btn>
          </div>
        )}
        <a
          href="https://github.com/lightningnetwork/lnd/tree/master/docs"
          target="_blank"
        >
          lncli Documentation
        </a>
      </v-container>
    );
  },
});
