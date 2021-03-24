import { defineComponent, computed } from "@vue/composition-api";
import { VCard, VContainer, VRow, VCol, VSwitch, VCheckbox } from "vuetify/lib";
import useStripeCheckout from "~/compositions/useStripeCheckout";
import { createStore } from "~/store";
import { Subscription, Plan, Product } from "~/utils/voltageProducts";
import useNodePricing from "~/compositions/useNodePricing";

export default defineComponent({
  setup: () => {
    const cart = computed(() => createStore.cart);

    const planState = computed({
      get: () => createStore.planState as Subscription<Plan, Product.podcast>,
      set: (v: Subscription<Plan, Product.podcast>) =>
        createStore.PLAN_STATE(v),
    });

    const { stripeCheckout } = useStripeCheckout(cart);
    const { yearlyBilling, podcastPlan } = useNodePricing();

    async function checkout(plan?: Subscription<Plan, Product.podcast>) {
      planState.value = Object.assign({}, podcastPlan.value);
      // serialize store for retrieval after redirect
      createStore.SERIALIZE();
      await stripeCheckout("/create/lnd");
    }

    return () => (
      <VCard>
        <VContainer>
          <VRow justify="center">
            <VCol class="d-flex flex-column text-center" cols="12" md="10">
              <div class="text-h4">Welcome to Podcasting 2.0</div>
              <div class="overline">
                Let your listeners stream sats while they listen to your podcast
              </div>
              <div class="my-6 text-h4">Create your node to get started</div>
              <div class="d-flex flex-row justify-space-around flex-wrap">
                <VCol cols="12" md="6" lg="4">
                  <VCard onClick={checkout} class="pa-6" color="secondary">
                    <div class="d-flex flex-column">
                      <div class="text-h5">Monthly</div>
                      <div class="text-h6">${podcastPlan.value.cost}/mo</div>
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
          </VRow>
        </VContainer>
      </VCard>
    );
  },
});
