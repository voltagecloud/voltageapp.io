import { defineComponent, ref } from "@vue/composition-api";
import { VCard, VContainer, VRow, VCol, VSwitch, VCheckbox } from "vuetify/lib";
import useNodePricing from "~/compositions/useNodePricing";
import useCart from "~/compositions/useCart";
import useStripeCheckout from "~/compositions/useStripeCheckout";
import type { Subscription, Plan, Product } from "~/utils/voltageProducts";

export default defineComponent({
  setup: () => {
    const { litePlan, standardPlan, yearlyBilling } = useNodePricing();

    const { cart, planState } = useCart();

    const { stripeCheckout } = useStripeCheckout(cart);

    const includeBreeze = ref(false);

    async function checkout(plan?: Subscription<Plan, Product>) {
      if (!plan) return
      planState.value = Object.assign({}, plan);
      await stripeCheckout('/create/lnd');
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
              <div class="d-flex flex-row justify-center align-center">
                <div class="mx-4">Montly</div>
                <VSwitch
                  inset
                  value={yearlyBilling.value}
                  onChange={(v: boolean) => {
                    yearlyBilling.value = v;
                  }}
                />
                <div class="mx-2">Yearly</div>
              </div>
              <div class="d-flex flex-row justify-center align-center">
                <VCheckbox
                  value={includeBreeze.value}
                  onChecked={(v: boolean) => {
                    includeBreeze.value = v;
                  }}
                >
                  <div slot="label" class="d-flex flex-row align-center">
                    Include a channel from
                    <img
                      src={require("~/assets/breez.png")}
                      alt="Breeze Logo"
                      width="80"
                    />
                  </div>
                </VCheckbox>
              </div>
              <div class="d-flex flex-row justify-space-around">
                <VCol cols="4">
                  <VCard
                    onClick={() => checkout(litePlan.value)}
                    class="pa-6"
                    color="secondary"
                  >
                    <div class="d-flex flex-column">
                      <div class="text-h5">Basic</div>
                      <div class="text-h6">{litePlan.value?.cost || ''}</div>
                    </div>
                  </VCard>
                </VCol>
                <VCol cols="4">
                  <VCard
                    onClick={() => checkout(standardPlan.value)}
                    class="pa-6"
                    color="secondary"
                  >
                    <div class="d-flex flex-column">
                      <div class="text-h5">Premium</div>
                      <div class="text-h6">{standardPlan.value?.cost || ''}</div>
                    </div>
                  </VCard>
                </VCol>
              </div>
            </VCol>
          </VRow>
        </VContainer>
      </VCard>
    );
  },
});
