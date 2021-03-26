import { defineComponent, computed } from "@vue/composition-api";
import {
  VCard,
  VContainer,
  VCol,
  VCheckbox,
  VProgressCircular,
} from "vuetify/lib";
import useStripeCheckout from "~/compositions/useStripeCheckout";
import { createStore } from "~/store";
import { Subscription, Plan, Product } from "~/utils/voltageProducts";
import useNodePricing from "~/compositions/useNodePricing";
import { Network } from '~/types/api'

export default defineComponent({
  setup: () => {
    const cart = computed(() => createStore.cart);

    const planState = computed({
      get: () => createStore.planState as Subscription<Plan, Product.podcast>,
      set: (v: Subscription<Plan, Product.podcast>) =>
        createStore.PLAN_STATE(v),
    });

    const { stripeCheckout, loading } = useStripeCheckout(cart);
    const { yearlyBilling, podcastPlan } = useNodePricing();

    async function checkout(plan?: Subscription<Plan, Product.podcast>) {
      planState.value = Object.assign({}, podcastPlan.value);
      // serialize store for retrieval after redirect
      createStore.NETWORK(Network.mainnet)
      createStore.dispatchCreate();
      await stripeCheckout("/create/lnd");
    }

    return () => (
      <VCard>
        <VContainer>
          <div class="d-flex justify-center">
            <VCol
              class="d-flex flex-column align-center text-center"
              cols="12"
              md="10"
            >
              <div class="text-h4">Welcome to Podcasting 2.0</div>
              <div class="overline">
                Let your listeners stream sats while they listen to your podcast
              </div>
              <div class="overline d-flex flex-row align-center justify-center">
                Automatically get inbound channels from
                <img src={require("~/assets/breez.png")} height="100" contain />
              </div>
              <div class="my-6 text-h4">Create your node to get started</div>
              <div
                class="d-flex flex-row justify-space-around flex-wrap"
                style="width: 100%"
              >
                <VCol cols="12" md="6" lg="4">
                  <VCard onClick={checkout} class="pa-6" color="secondary">
                    <div class="d-flex flex-column align-center">
                      {loading.value ? (
                        <VProgressCircular indeterminate />
                      ) : (
                        <div>
                          <div class="text-h5">Podcast Node</div>
                          <div class="text-h6">
                            ${podcastPlan.value.cost}/mo
                          </div>
                        </div>
                      )}
                    </div>
                  </VCard>
                </VCol>
              </div>
              <VCheckbox
                value={yearlyBilling.value}
                onChange={(v: boolean) => (yearlyBilling.value = v)}
                label="Pay for the year, save 23%"
              />
            </VCol>
          </div>
        </VContainer>
      </VCard>
    );
  },
});
