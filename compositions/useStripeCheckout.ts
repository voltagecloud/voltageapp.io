import { ref, Ref } from "@vue/composition-api";
import { loadStripe } from "@stripe/stripe-js";
import { voltageFetch } from "~/utils/fetchClient";

export interface Cart {
  items: {
    plan: string;
    quantity: number;
    type: string;
  }[];
}

export default function useStripeCheckout(cart: Ref<Cart>) {
  const stripePromise = loadStripe(process.env.stripeKey as string);

  const loading = ref(false);
  const error = ref("");

  const port = window.location.port ? `:${window.location.port}` : ''
  const base = `${window.location.protocol}//${window.location.hostname}${port}`

  async function stripeCheckout(path: string) {
    loading.value = true;
    const redirect = `${base}${path}`
    console.log({ redirect })
    try {
      const res = await voltageFetch("/stripe/session", {
        method: "POST",
        body: JSON.stringify({
          items: cart.value.items,
          redirect
        }),
      });
      const json = await res.json();
      console.log({ json });
      const { session_id } = json;
      const stripe = await stripePromise;

      if (!stripe) {
        error.value = "There was a problem contacting stripe servers";
        return;
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: session_id,
      });
      error.value = stripeError.message || "";
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
    stripeCheckout,
  };
}
