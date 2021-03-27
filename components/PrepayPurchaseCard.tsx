import { defineComponent, computed } from "@vue/composition-api";
import { VCard, VBtn, VDivider, VSlider, VContainer } from "vuetify/lib";
import { createStore } from "~/store";
import useStripeCheckout from "~/compositions/useStripeCheckout";
import useBitcoinCheckout from "~/compositions/useBitcoinCheckout";
import { Product } from "~/utils/voltageProducts";

enum Checkout {
  bitcoin = "bitcoin",
  stripe = "stripe",
}

export default defineComponent({
  props: {
    callbackPath: {
      type: String,
      required: true,
    },
    allowChangeQty: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup: (props) => {
    const cart = computed(() => createStore.cart);
    const planQty = computed({
      get: () => createStore.planQty,
      set: (v: number) => createStore.PLAN_QTY(v),
    });

    const { stripeCheckout, loading, error } = useStripeCheckout(cart);
    const {
      confirmBitcoin,
      loading: btcLoading,
      error: btcError,
    } = useBitcoinCheckout(cart);

    async function handleCheckout(type: Checkout) {
      createStore.SERIALIZE();
      if (type === Checkout.bitcoin) {
        await confirmBitcoin();
      } else if (type === Checkout.stripe) {
        await stripeCheckout(props.callbackPath);
      }
    }

    const planState = computed(() => createStore.planState);

    return () => (
      <VCard>
        <VContainer>
          <div class="d-flex flex-column justify-center">
            <div class="text-h5 text-center">Order Details</div>
            <div class="d-flex justify-space-between my-3">
              <div>{planState.value.name}</div>
              <div>${planState.value.cost}/mo</div>
            </div>
            <div class="d-flex flex-column justify-space-between my-3">
              <div class="text-h6">Description</div>
              <div class="text-caption">{planState.value.desc}</div>
            </div>
            {planState.value.nodeType !== Product.btcPay && (
              <div>
                <div class="my-3">
                  <div>Node Quantity: {planQty.value}</div>
                  {props.allowChangeQty && (
                    <VSlider
                      class="mt-10"
                      onChange={(val: number) => {
                        planQty.value = val;
                      }}
                      value={planQty.value}
                      thumb-label="always"
                      track-color="highlight"
                      color="primary"
                      max="25"
                      min="1"
                    />
                  )}
                </div>
                <VDivider />
              </div>
            )}
            <div class="d-flex justify-space-between">
              <div>Total:</div>
              <div class="font-weight-bold">${cart.value.totalPrice}</div>
            </div>
            <VDivider />
            <VBtn
              block
              onClick={() => handleCheckout(Checkout.stripe)}
              loading={loading.value}
              class="my-2"
              color="highlight"
            >
              Checkout with Card
            </VBtn>
            <VBtn
              block
              onClick={() => handleCheckout(Checkout.bitcoin)}
              loading={btcLoading.value}
              class="my-2"
              color="highlight"
            >
              Checkout with Bitcoin
            </VBtn>
            <div class="text--error">{error.value || btcError.value}</div>
          </div>
        </VContainer>
      </VCard>
    );
  },
});
