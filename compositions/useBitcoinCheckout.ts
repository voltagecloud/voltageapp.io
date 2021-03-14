import { ref, computed } from "@vue/composition-api";
import type { ComputedRef } from "@vue/composition-api";
import type { Cart } from "~/store/create";
import { Plan } from "~/utils/voltageProducts";
import { voltageFetch } from '~/utils/fetchClient'

export default function useBitcoinCheckout(cart: ComputedRef<Cart>) {

  const needsConfirmation = computed(
    () => !!cart.value.items.find((item) => item.plan === Plan.monthly)
  );

  // should the user be prompted to confirm monthly bitcoin purchases
  const confirmModal = ref(false)
  async function confirmBitcoin() {
    if (needsConfirmation.value) {
      confirmModal.value = true
    } else {
      await bitcoinCheckout()
    }
  }

  const loading = ref(false)
  const error = ref('')
  async function bitcoinCheckout() {
    confirmModal.value = false;
    loading.value = true;
    try {
      const res = await voltageFetch('/btcpay/session', {
        method: 'POST',
        body: JSON.stringify({
          items: cart.value.items
        })
      })
      const { redirect_url } = await res.json()
      window.location = redirect_url
    } catch (e) {
      console.log(e);
      error.value = "There was a problem processing request";
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    confirmBitcoin
  }
}
