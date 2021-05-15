import { defineComponent } from "@vue/composition-api";
import { VContainer, VSheet, VProgressCircular, VCol, VImg } from "vuetify/lib";

import useFetch from "~/compositions/useFetch";

export default defineComponent({
  components: {
    QrcodeVue: () => import("qrcode.vue"),
    CopyPill: () => import("~/components/core/CopyPill.vue"),
  },
  setup: () => {
    const { data, loading, error } = useFetch<{ lnurl: string }>(
      "/promo?event=btc2021"
    );

    return () => (
      <VContainer>
        <VCol cols="12" sm="10" md="8" lg="6" xl="4" class="mx-auto">
          <VSheet class="rounded-lg d-flex flex-column justify-center align-center pa-3">
            <VImg src={require("~/assets/btcconf2021.png")} class="pa-3" />
            <div class="text-h6">Voltage Sats Giveaway</div>
            {loading.value ? (
              <VProgressCircular indeterminate class="justify-self-center" />
            ) : data.value ? (
              <span>
                <Qrcode-Vue value={data.value.lnurl} size={300} />
                <copy-pill value={data.value.lnurl} />
                <div>
                  Scan or paste the LNURL into your favourite lightning wallet
                  to receive your sats. Enjoy BTC Conf 2021!
                </div>
              </span>
            ) : (
              <div>
                {error.value?.message ||
                  "An error occured please try again later"}
              </div>
            )}
          </VSheet>
        </VCol>
      </VContainer>
    );
  },
});
