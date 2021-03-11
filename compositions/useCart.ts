import { computed, ref } from "@vue/composition-api";
import {
  Plan,
  Product,
  Subscription,
  standardPlans,
} from "~/utils/voltageProducts";

export default function useCart(initial?: Subscription<Plan, Product>) {
  const planState = ref<Subscription<Plan, Product>>(
    Object.assign({}, initial || standardPlans[0])
  );

  const planQty = ref(1);
  const includeBtcPay = ref(false);
  const btcPayAddonMonthly = computed(() =>
    planState.value?.plan === Plan.monthly ? 8.99 : 6.99
  );

  const cart = computed(() => {
    const isBtcPay = planState.value.nodeType === Product.btcPay;
    const timeMultiplier = planState.value.plan === Plan.monthly ? 1 : 12;

    const addonPrice =
      includeBtcPay.value && !isBtcPay
        ? timeMultiplier * btcPayAddonMonthly.value
        : 0;

    const multiplier =
      planState.value.nodeType === Product.btcPay ? 1 : planQty.value;

    const totalPrice = (
      timeMultiplier * multiplier * planState.value.cost +
      addonPrice
    ).toFixed(2);

    const items: { plan: string; quantity: number; type: string }[] = [
      {
        plan: isBtcPay ? planState.value.plan : `node_${planState.value.plan}`,
        quantity: isBtcPay ? 1 : planQty.value,
        type: planState.value.nodeType,
      },
    ];

    if (addonPrice) {
      const btcPayPlanName = planState.value.plan.replace("node_", "");
      items.push({
        plan: btcPayPlanName,
        quantity: 1,
        type: Product.btcPay,
      });
    }
    return {
      totalPrice,
      items,
    };
  });

  return {
    cart,
    planQty,
    includeBtcPay,
    planState,
    btcPayAddonMonthly,
  };
}
