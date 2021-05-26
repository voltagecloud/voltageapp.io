import {
  defineComponent,
  PropType,
  computed
} from "@vue/composition-api";
import { Node } from "~/types/apiResponse";
import { macaroonStore } from "~/store";
import NamedCopyPill from "~/components/core/NamedCopyPill.tsx";
import Base64Download from "~/components/core/Base64Download.tsx";


export default defineComponent({
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true
    }
  },
  setup: props => {
    const macaroon = computed(() => {
      return macaroonStore.macaroonState({
        nodeId: props.node.node_id,
        type: "admin"
      });
    });

    const meta = computed(() => {
      return macaroonStore.findNodeMeta({ nodeId: props.node.node_id });
    });

    const certButtonText = computed(() =>
      meta.value?.tlsCert === "pending" && meta.value?.tlsCert
        ? "Certificate is Pending"
        : "Download Certificate"
    );

    return () => (
      <div class="text-center">
        <p class="font-weight-light text--darken-1 v-card__title justify-center align-center">
          Manual
        </p>
        <p>
          Need to connect to an app not listed here? Get everything you need to
          connect below.
        </p>

        <NamedCopyPill title="API Endpoint" value={meta.value?.endpoint!} />

        <Base64Download title="Macaroon" buttonText="Download Macaroon" filename="admin.macaroon" base64={macaroon.value.macaroon} />

        <NamedCopyPill title="Macaroon Hex" value={macaroon.value.macaroonHex} />

        <Base64Download title="TLS Certificate" buttonText={certButtonText.value} filename="tls.cert" base64={meta.value?.tlsCert!} />

      </div>
    );
  }
});
