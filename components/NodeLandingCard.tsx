import { defineComponent, computed } from "@vue/composition-api";
import { useRouter } from "@nuxtjs/composition-api";
import useFetch from "~/compositions/useFetch";
import {
  VCard,
  VCardTitle,
  VCardText,
  VCardActions,
  VContainer,
  VRow,
  VCol,
  VImg,
} from "vuetify/lib";

export default defineComponent({
  components: {
    VCard,
    VCardTitle,
    VCardText,
    VCardActions,
    VContainer,
    VRow,
    VCol,
    VImg,
  },
  setup: () => {
    const { data, dispatch } = useFetch<any>("/user");
    dispatch({ method: "GET" });

    const products = computed(() => [
      {
        title: "Lightning Node",
        src: require("~/assets/lnd-logo.png"),
        to: "/create/lnd",
      },
      {
        title: "BTCPay Server",
        src: require("~/assets/btcpay-logo.svg"),
        to: data.value?.btcpayservers ? "/btcpay" : "/create/btcpay",
      },
    ]);

    const router = useRouter();

    return () => (
      <v-card key="no-nodes" color="info">
        <v-card-title class="justify-center text-h5" style="word-break: normal">
          <div class="text-center">Welcome to Voltage! Let's get started.</div>
        </v-card-title>
        <v-card-text class="text-center">
          <div>
            Voltage offers products that make using Bitcoin and the Lightning
            Network easy. Get started on Mainnet or Testnest in just a few
            clicks.
          </div>
        </v-card-text>
        <v-card-text class="mt-6 text-center font-weight-bold text-h6">
          <div>What would you like to create?</div>
        </v-card-text>
        <v-card-actions class="text-center">
          <v-container>
            <v-row>
              {products.value.map((product, i) => (
                <v-col key={i} cols="12" sm="6">
                  <v-card
                    onClick={() => router.push(product.to)}
                    class="text-center d-flex flex-column justify-space-between"
                    style="height: 200px"
                  >
                    <v-img
                      src={product.src}
                      max-height="150"
                      max-width="150"
                      class="mx-auto my-3"
                      contain
                    />
                    <div class="font-weight-bold">{product.title}</div>
                  </v-card>
                </v-col>
              ))}
            </v-row>
          </v-container>
        </v-card-actions>
      </v-card>
    );
  },
});
