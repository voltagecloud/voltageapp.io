import {
  defineComponent,
  createElement,
  PropType,
  computed,
  reactive,
} from "@vue/composition-api";
import { Node } from "~/types/apiResponse";
import { base64ToHex, decryptString } from "~/utils/crypto";
import { MacaroonType } from "~/utils/bakeMacaroon";
import useBackupMacaroon from "~/compositions/useBackupMacaroon";
import { macaroonStore } from "~/store";

const h = createElement;

export default defineComponent({
  components: {
    CopyPill: () => import("~/components/core/CopyPill.vue"),
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
    const password = computed(
      () =>
        macaroonStore.nodePasswords.find((e) => e.nodeId === props.node.node_id)
          ?.password || ""
    );

    const meta = computed(() =>
      macaroonStore.findNodeMeta({ nodeId: props.node.node_id })
    );

    const adminMacaroon = computed(() =>
      macaroonStore.macaroonState({
        nodeId: props.node.node_id,
        type: MacaroonType.admin,
      })
    );

    const state = reactive({
      loading: false,
    });

    const btcMac = computed(() =>
      macaroonStore.macaroonState({
        nodeId: props.node.node_id,
        type: MacaroonType.btcpayserver,
      })
    );

    const connectionString = computed(() =>
      btcMac.value.macaroon
        ? `type=lnd-rest;server=https://${meta.value?.endpoint}:8080/;macaroon=${btcMac.value.macaroonHex}`
        : ""
    );

    // attempt to load the macaroon if it exists
    async function getMac() {
      if (btcMac.value.macaroonHex) return;
      state.loading = true;
      await macaroonStore.FETCH_MACAROON({
        nodeId: props.node.node_id,
        macaroonType: MacaroonType.btcpayserver,
        password: password.value,
      });
      state.loading = false;
    }
    getMac();

    const { loading, error, bakeBackupMacaroon } = useBackupMacaroon();

    async function handleCreation() {
      return await bakeBackupMacaroon({
        endpoint: meta.value?.endpoint as string,
        macaroonType: MacaroonType.btcpayserver,
        macaroonHex: adminMacaroon.value.macaroonHex,
        nodeId: props.node.node_id,
        password: password.value,
      });
    }

    return () => (
      <v-container class="text-center">
        <p class="font-weight-light text--darken-1 v-card__title justify-center align-center">
          <a href="https://btcpayserver.org" target="_blank">
            BTCPay Server
          </a>
        </p>
        {!props.node.settings.rest ? (
          <div>
            <div
              class="font-weight-light text--darken-1 justify-center align-center"
              max-width="800"
              style="color: #ff0000; padding: 20px;"
            >
              BTCPay uses the REST API to communicate with your node. You have
              this API disabled in your node settings. Please enable it to
              connect with BTCPay
            </div>
            <ul>
              <li>Go to your Store in BTCPay Server and click 'Settings'</li>
              <li>
                Scroll down to 'Lightning Network Experimental' and select
                'Modify' for 'BTC'
              </li>
              <li>
                Copy and paste the connection string below into BTCPay Server
              </li>
              <li>Click Save</li>
            </ul>
          </div>
        ) : (
          <div></div>
        )}
        {btcMac.value.macaroonHex ? (
          <div>
            <p>Connection String</p>
            <copy-pill
              class="text-break"
              text={connectionString.value}
              color="accent"
              text-color="warning"
            />
            <p class="font-weight-light">click to copy</p>
          </div>
        ) : (
          <div>
            <p>Please generate a macaroon for BTCPay Server first.</p>
            <v-btn
              class="info--text"
              color="warning"
              onClick={handleCreation}
              loading={state.loading || loading.value}
            >
              Create Macaroon
            </v-btn>
          </div>
        )}
        <div>{error.value}</div>
        <a
          href="https://docs.btcpayserver.org/LightningNetwork/#connecting-your-internal-lightning-node-in-btcpay"
          target="_blank"
        >
          BTCPay Server Documentation.
        </a>
      </v-container>
    );
  },
});
