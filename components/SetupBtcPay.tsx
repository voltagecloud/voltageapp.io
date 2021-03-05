import {
  defineComponent,
  createElement,
  computed,
  reactive,
} from "@vue/composition-api";
import { macaroonStore } from "~/store";
import { MacaroonType, bakeMacaroon } from "~/utils/bakeMacaroon";
import { VProgressCircular, VBtn, VCard } from "vuetify/lib";
import crypto from "crypto-js";
import { voltageFetch } from "~/utils/fetchClient";
import useFetch from "~/compositions/useFetch";
import useBackupMacaroon from "~/compositions/useBackupMacaroon";

const h = createElement;

export default defineComponent({
  components: {
    VProgressCircular,
    NodePasswordInput: () => import("~/components/NodePasswordInput.vue"),
    VBtn,
    VCard,
  },
  props: {
    nodeId: {
      type: String,
      required: true,
    },
  },
  setup: (props, ctx) => {
    const macaroonState = computed(() =>
      macaroonStore.macaroonState({
        nodeId: props.nodeId,
        type: "btcpayserver",
      })
    );
    const nodeEndpoint = computed(() =>
      macaroonStore.findNodeMeta({ nodeId: props.nodeId })
    );

    const { dispatch, data } = useFetch<any>("/node");
    dispatch({
      method: "POST",
      body: JSON.stringify({
        node_id: props.nodeId || "",
      }),
    });

    const state = reactive({
      loading: false,
      error: "",
      retry: false,
    });

    const { loading, error, bakeBackupMacaroon } = useBackupMacaroon();
    async function handlePassword(password: string) {
      state.error = "";
      state.retry = false;
      const nodeId = props.nodeId;
      state.loading = true;
      const error = await macaroonStore.FETCH_MACAROON({
        nodeId,
        macaroonType: "btcpayserver",
        password,
      });
      state.loading = false;
      // handle case where btcpay macaroon doesnt exits yet
      if (error) {
        // coundlt get pay server macaroon, try admin one
        const adminErr = await macaroonStore.FETCH_MACAROON({
          nodeId,
          macaroonType: "admin",
        });
        const adminMacaroon = macaroonStore.macaroonState({
          nodeId,
          type: "admin",
        });
        if (adminErr) {
          state.error =
            "Could not retrieve admin macaroon. Please make sure this node has been initialized";
          return;
        }
        await bakeBackupMacaroon({
          endpoint: nodeEndpoint.value?.endpoint || "",
          macaroonHex: adminMacaroon.macaroonHex,
          password: adminMacaroon.password,
          nodeId: props.nodeId,
          macaroonType: MacaroonType.btcpayserver,
        });
        if (!error.value) {
          ctx.emit("done");
        }
      }
      // btc pay macaroon is in store make sure it was decrypted properly
      else if (!macaroonState.value.error) {
        ctx.emit("done");
        // there was an error decrpyting macaroon
      } else {
        state.error = macaroonState.value.error;
      }
    }

    return () => {
      if (!macaroonState.value.password || state.retry) {
        return (
          <node-password-input
            onDone={handlePassword}
            topText="Authorize BTCPay Server to communicate with your node"
            subText={
              data.value?.node_name
                ? `Enter the password for ${data.value.node_name}`
                : ""
            }
            text="Enter node password"
          />
        );
      } else if (state.loading || state.error || error.value || loading.value) {
        return (
          <v-card class="pa-4 text-center">
            {state.loading && <v-progress-circular indeterminate />}
            <div>Retrieving Macaroons</div>
            {state.error && (
              <div>
                {state.error || error.value}
                <v-btn block onClick={() => (state.retry = true)}>
                  Retry
                </v-btn>
              </div>
            )}
          </v-card>
        );
      }
    };
  },
});
