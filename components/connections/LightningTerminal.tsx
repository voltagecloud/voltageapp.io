import {
  defineComponent,
  PropType,
  computed,
} from "@vue/composition-api";
import type { Node } from "~/types/apiResponse";
import { macaroonStore } from "~/store";
import { VContainer } from "vuetify/lib";
import CodeSnippet from "~/components/core/CodeSnippet";
import Base64Download from "~/components/core/Base64Download.tsx";

export default defineComponent({
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

    const endpoint = computed(() => macaroonStore.findNodeMeta({ nodeId: props.node.node_id })?.endpoint || "");

    const cert = computed(() => macaroonStore.findNodeMeta({ nodeId: props.node.node_id })?.tlsCert || "");

    const certValid = computed(() => cert.value && cert.value !== "pending");
    const certButtonText = computed(() =>
      certValid.value ? "Download Certificate" : "Certificate is Pending"
    );

    const snippetText = computed(
      () => `remote.lnd.rpcserver=${endpoint.value}:10009
remote.lnd.macaroonpath=/path/to/admin.macaroon
remote.lnd.tlscertpath=/path/to/tls.cert
`
    );

    return () => (
      <VContainer class="text-center">
        <p class="font-weight-light text--darken-1 v-card__title justify-center align-center">
          <a href="https://github.com/lightninglabs/lightning-terminal" target="_blank">
            Lightning Terminal (LiT)
          </a>
        </p>
        {!props.node.settings.grpc ? (
          <div
            class="font-weight-light text--darken-1 justify-center align-center"
            max-width="800"
            style="color: #ff0000; padding: 20px;"
          >
            LiT uses gRPC to communicate with your node. You have this API
            disabled in your node settings. Please enable it to connect with
            LiT.
          </div>
        ) : (
            <div>
              <p>To connect with Lightning Terminal you'll need a <code>lit.conf</code> file placed where LiT can find it. The default location depends on your platform:</p>
              <p>MacOS: <code>~/Library/Application Support/Lit/lit.conf</code></p>
              <p>Linux: <code>~/.lit/lit.conf</code></p>
              <p>Windows: <code>~/AppData/Roaming/Lit/lit.conf</code></p>
              <p>Create that file (and directories, if needed), then add the following contents:</p>
              <CodeSnippet>{snippetText.value}</CodeSnippet>
              <p>Adjust the relevant paths to point to your node's TLS Cert and Macaroon files.</p>
              <Base64Download title="Macaroon" buttonText="Download Macaroon" filename="admin.macaroon" base64={macaroon.value} />

              <Base64Download title="TLS Certificate" buttonText={certButtonText.value} filename="tls.cert" base64={cert.value} disabled={!certValid.value} />

              <p>Now you can run litd like this:</p>
              <CodeSnippet>
                litd --uipassword=somethingsecure
              </CodeSnippet>
              <p>
                You should be given a URL to go to, <code>https://localhost:8443</code> is the default. You'll be warned about an insecure connection, but that's just referring to the local server, not LiT's remote connection with your lightning node.
            </p>
              <p>If your node is running in testnet mode, add the <code>--network=testnet</code> flag.</p>
            </div>
          )}
        <a
          href="https://docs.lightning.engineering/lightning-network-tools/lightning-terminal/get-lit"
          target="_blank"
        >
          Lightning Terminal Documentation
        </a>
      </VContainer>
    );
  },
});
