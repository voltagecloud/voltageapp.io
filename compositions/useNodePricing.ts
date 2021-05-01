import { computed, ref } from "@vue/composition-api";
import {
  standardPlans,
  litePlans,
  podcastPlans,
  subscriptions,
  Plan,
  Subscription,
  Product,
} from "~/utils/voltageProducts";
import { createStore } from "~/store";

export type planName =
  | "Pay per Month"
  | "Pay per Year"
  | "Pay per Hour"
  | "Trial";

export const namedPlans: { name: planName; plan: Plan }[] = [
  { name: "Pay per Month", plan: Plan.monthly },
  { name: "Pay per Year", plan: Plan.yearly },
  { name: "Pay per Hour", plan: Plan.payAsYouGo },
  { name: "Trial", plan: Plan.trial },
];

export default function useNodePricing() {
  const billingCycle = computed({
    get: () => createStore.planState.plan,
    set: (p: Plan) => {
      const { nodeType } = createStore.planState
      const newPlan = subscriptions.find(e => e.nodeType === nodeType && e.plan === p)
      if (newPlan) {
        createStore.PLAN_STATE(newPlan)
      }
    }
  });

  const yearlyBilling = computed({
    get: () => billingCycle.value === Plan.yearly,
    set: (v: boolean) => {
      const newBill = v ? Plan.yearly : Plan.monthly
      billingCycle.value = newBill
    }
  });

  const mappedBillingName = computed({
    get: () => {
      return namedPlans.find((mapping) => mapping.plan === billingCycle.value)
        ?.name as planName;
    },
    set: (v: planName) => {
      billingCycle.value = namedPlans.find((mapping) => mapping.name === v)
        ?.plan as Plan;
    },
  });

  const litePlan = computed(
    () =>
      litePlans.find((e) => e.plan === billingCycle.value) as Subscription<
        Plan,
        Product.lite
      >
  );
  const standardPlan = computed(
    () =>
      standardPlans.find((e) => e.plan === billingCycle.value) as Subscription<
        Plan,
        Product.standard
      >
  );

  const podcastPlan = computed(
    () =>
      podcastPlans.find((e) => e.plan === billingCycle.value) as Subscription<
        Plan,
        Product.podcast
      >
  );

  return {
    billingCycle,
    litePlan,
    standardPlan,
    podcastPlan,
    yearlyBilling,
    mappedBillingName
  };
}
