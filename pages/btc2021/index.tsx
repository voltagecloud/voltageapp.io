import { defineComponent, computed } from "@vue/composition-api";
import { VContainer, VSheet, VProgressCircular, VCol, VImg, VBtn } from "vuetify/lib";
import { authStore } from "~/store";

import useFetch from "~/compositions/useFetch";

export default defineComponent({
  components: {
    QrcodeVue: () => import("qrcode.vue"),
    CopyPill: () => import("~/components/core/CopyPill.vue"),
  },
  setup: () => {
    const { data, loading, error } = useFetch<{ lnurl: string }>(
      "/promo/bitcoin2021",
      computed(() => ({
        pause: !authStore.user
      }))
    );

    return () => (
      <VContainer>
        <VCol cols="12" sm="10" md="8" lg="6" xl="4" class="mx-auto">
          <VSheet class="rounded-lg d-flex flex-column justify-center align-center pa-3">
            <VImg src={require("~/assets/btcconf2021.png")} class="pa-3" />
            <div class="text-h6">Claim your 3,000 Satoshis now</div>
            {!authStore.user ? (
              <span>
                <div>Register or Login to your Voltage account to claim your free sats!</div>
                <VBtn block dark color="highlight" to="/register" class="my-2">Register</VBtn>
              </span>
            )
            : loading.value ? (
              <VProgressCircular indeterminate class="justify-self-center" />
            ) : data.value ? (
              <div class="d-flex flex-column align-center">
                <Qrcode-Vue value={data.value.lnurl} size={200} class="mt-3" />
                <div class="mb-3">
                  <copy-pill text={data.value.lnurl} color="accent" text-color="warning" />
                </div>
                <div>
                  Scan or paste the LNURL into your favorite lightning wallet
                  to receive your sats. Enjoy Bitcoin 2021!
                </div>
              </div>
            ) : (
              <div>
                {error.value ||
                  "An error occured please try again later"}
              </div>
            )}
          </VSheet>
        </VCol>
      </VContainer>
    );
  },
});
