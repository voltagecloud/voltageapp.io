import { defineComponent, computed } from "@vue/composition-api";
import { VCard, VList, VListItem, VBtn } from "vuetify/lib";
import { createStore } from "~/store";
import useStripeCheckout from "~/compositions/useStripeCheckout";
import useBitcoinCheckout from "~/compositions/useBitcoinCheckout";

enum Checkout {
  bitcoin = 'bitcoin',
  stripe = 'stripe'
}

export default defineComponent({
  props: {
    callbackPath: {
      type: String,
      required: true
    }
  },
  setup: (props) => {
    const cart = computed(() => createStore.cart);

    const { stripeCheckout, loading, error } = useStripeCheckout(cart);
    const {
      confirmBitcoin,
      loading: btcLoading,
      error: btcError,
    } = useBitcoinCheckout(cart);

    async function handleCheckout (type: Checkout) {
      createStore.SERIALIZE()
      if (type === Checkout.bitcoin) {
        await confirmBitcoin()
      } else if (type === Checkout.stripe) {
        await stripeCheckout(props.callbackPath)
      }
    }

    return () => (
      <VCard>
        <div class="d-flex flex-column justify-center">
          <VList>
            {cart.value.items.map((item) => (
              <VListItem>
                <div class="d-flex flex-row justify-space-around">
                  <div>{item.plan}</div>
                  <div>{item.quantity}</div>
                </div>
              </VListItem>
            ))}
          </VList>
          <VBtn block onClick={() => handleCheckout(Checkout.stripe)} loading={loading.value}>
            Checkout with Card
          </VBtn>
          <VBtn block onClick={() => handleCheckout(Checkout.bitcoin) } loading={btcLoading.value}>
            Checkout with Bitcoin
          </VBtn>
          <div class="text--error">{error.value || btcError.value}</div>
        </div>
      </VCard>
    );
  },
});
