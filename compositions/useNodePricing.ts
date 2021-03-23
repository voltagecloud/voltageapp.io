import { computed, ref } from "@vue/composition-api";
import { standardPlans, litePlans, Plan } from "~/utils/voltageProducts";

export type planName = "Pay per Month" | "Pay per Year" | "Pay per Hour" | "Trial";

export const namedPlans: { name: planName; plan: Plan }[] = [
  { name: "Pay per Month", plan: Plan.monthly },
  { name: "Pay per Year", plan: Plan.yearly },
  { name: "Pay per Hour", plan: Plan.payAsYouGo },
  { name: "Trial", plan: Plan.trial },
];

export default function useNodePricing() {
  const billingCycle = ref<Plan>(Plan.monthly);

  const yearlyBilling = computed({
    get: () => billingCycle.value === Plan.yearly,
    set: (v: boolean) => (billingCycle.value = v ? Plan.yearly : Plan.monthly),
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

  const litePlan = computed(() =>
    litePlans.find((e) => e.plan === billingCycle.value)
  );
  const standardPlan = computed(() =>
    standardPlans.find((e) => e.plan === billingCycle.value)
  );

  return {
    billingCycle,
    litePlan,
    standardPlan,
    yearlyBilling,
    mappedBillingName,
  };
}
