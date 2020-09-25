<template lang="pug">
  v-container
    v-card
      div(style='padding: 20px;').text-center
        v-card-text.font-weight-light.text--darken-1.v-card__title.justify-center.align-center.display-1
          | Purchase Lightning Nodes
        v-container.justify-center.align-center
          p.text--darken-1
            | Payment Interval
          v-row(align='center' justify='center')
            v-radio-group(v-model='planSelect' :column='false').text--darken-1
              v-radio(label='Year' value='node_yearly' key='node_yearly' style="padding-right: 20px;")
              v-radio(label='Month' value='node_monthly' key='node_monthly')
        p.display-3
          | ${{ monthlyBill }}
        p
          | per month
        p
        p.text--darken-1
          | Number of Nodes
        p.font-weight-light.text--darken-1
          input(v-model="quantity" style='max-width: 100px; font-size: 28px; border: 2px solid #a6a6a6; border-radius: 3px;' type="number" pattern="[0-9]*" min='1' :required='true' @click='changeQuantity').text-center
        p
          | Due Today: ${{ dueToday }}
        v-row(align='center' justify='center')
          v-container
            v-btn.px-4.info--text(block='' @click='selectPlanCard' :loading='loading' color='highlight')
              | Purchase Node with Card
        v-row(align='center' justify='center')
          v-container
            v-btn.px-4.info--text(block='' @click='selectPlanCard' color='highlight')
              | Purchase Node with Bitcoin
</template>
<script lang="ts">
import { defineComponent, SetupContext, reactive, computed, ref, watch } from '@vue/composition-api'
import { Network } from '~/types/api'
import axios from 'axios'
import useNodeApi from '~/compositions/useNodeApi'
import { loadStripe } from '@stripe/stripe-js'

export default defineComponent({
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  setup (_, { root }) {

    document.addEventListener('focusout', e => {console.log(e); changeQuantity()});

    const { getPurchaseSession } = useNodeApi(root.$nuxt.context)
    const stripeKey = process.env.stripeKey
    // @ts-ignore
    const loading = ref(false)
    // @ts-ignore
    const stripePromise = loadStripe(stripeKey)
    const quantity = ref(1)
    const monthlyBill = ref(24.99)
    const dueToday = ref(299.88)
    const defaultDueYearly = ref(299.88)
    const defaultDueMonthly = ref(29.99)
    const planSelect = ref('node_yearly')
    async function selectPlanCard() {
      loading.value = true
      const res = await root.$nuxt.context.$axios.post('/stripe/session', {
        items: [{
          plan: planSelect.value,
          quantity: quantity.value
        }]
      })
      const sessionId = res.data.session_id
      const stripe = await stripePromise;
      // @ts-ignore
      const { error } = await stripe.redirectToCheckout({
        sessionId
      });
    }

    // @ts-ignore
    function changePlan (event) {
      if (event === 'node_monthly') {
        planSelect.value = 'node_monthly'
        monthlyBill.value = 29.99
        dueToday.value = 29.99 * quantity.value
      } else if (event === 'node_yearly') {
        planSelect.value = 'node_yearly'
        monthlyBill.value = 24.99
        dueToday.value = 299.88 * quantity.value
      }
    }

    function changeQuantity () {
      let defaultDue = (planSelect.value == 'node_yearly') ? defaultDueYearly.value : defaultDueMonthly.value
      let newBill = quantity.value * defaultDue
      dueToday.value = parseFloat(newBill.toFixed(2))
    }

    watch(planSelect, changePlan)

    return {
      loading,
      selectPlanCard,
      planSelect,
      monthlyBill,
      dueToday,
      quantity,
      changeQuantity
    }
  }
})
</script>
<style lang="scss" scoped>
.make-bottom {
  bottom: 0;
  width: 100%;
  position: absolute;

  div {
    width: 100%;
  }
}

.pad-bottom {
  padding-bottom: 48px;
}

.v-card--hover {
  transition: all 0.5s;
  &:hover {
    transform: translateY(-3px);
  }
}
</style>
