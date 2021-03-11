import { computed, ref } from '@vue/composition-api'
import { standardPlans, litePlans, Plan } from '~/utils/voltageProducts'

export default function useNodePricing() {
  const billingCycle = ref<Plan>(Plan.monthly)

  const yearlyBilling = computed({
    get: () => billingCycle.value === Plan.yearly,
    set: (v: boolean) => billingCycle.value = v ? Plan.yearly : Plan.monthly
  })

  const litePlan = computed(() => litePlans.find(e => e.plan === billingCycle.value))
  const standardPlan = computed(() => standardPlans.find(e => e.plan === billingCycle.value))

  return {
    billingCycle,
    litePlan,
    standardPlan,
    yearlyBilling
  }
}
