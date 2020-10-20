<template lang="pug">
  v-container(style='max-width: 95%')
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
        v-row(v-if='errorMessage' align='center' justify='center')
          v-container
            p.px-4.error--text
              | {{ errorMessage }}
        v-row(align='center' justify='center')
          v-container
            v-btn.px-4.info--text(@click='selectPlanCard' :loading='loading' color='highlight')
              | Purchase Node with Card
        v-row(align='center' justify='center')
          v-container
            v-btn.px-4.info--text(@click='(planSelect == "node_monthly") ? confirmModal = true : selectPlanBitcoin()' :loading='btcLoading' color='highlight')
              | Purchase Node with Bitcoin

        v-row(align='center' justify='center')
          v-container
            p.font-weight-light.text--darken-1
              | • 71% cheaper than DIY on AWS
    v-dialog(v-model='confirmModal' max-width='60%')
      v-card
        v-card-text.pt-3.warning--text.text--darken-1(style='font-size: 18px;')
          | When purchasing a monthly subscription with Bitcoin you'll be required to manually pay a new invoice every month.
          | For that reason we recommend a yearly subscription.
        v-card-actions
          v-btn(color='info' @click='selectPlanBitcoin') Continue with monthly
          v-btn(@click='confirmModal = false') Go Back
</template>
<script lang="ts">
import { defineComponent, SetupContext, reactive, computed, ref, watch } from '@vue/composition-api'
import axios from 'axios'
import { loadStripe } from '@stripe/stripe-js'
import { Network } from '~/types/api'
import useNodeApi from '~/compositions/useNodeApi'

export default defineComponent({
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  setup (_, { root }) {
    document.addEventListener('focusout', (e) => { console.log(e); changeQuantity() })
    const confirmModal = ref(false)
    const { getPurchaseSession } = useNodeApi(root.$nuxt.context)
    const stripeKey = process.env.stripeKey
    // @ts-ignore
    const loading = ref(false)
    const btcLoading = ref(false)
    const errorMessage = ref('')
    // @ts-ignore
    const stripePromise = loadStripe(stripeKey)
    const quantity = ref(1)
    const monthlyBill = ref(26.99)
    const dueToday = ref(323.88)
    const defaultDueYearly = ref(323.88)
    const defaultDueMonthly = ref(31.99)
    const planSelect = ref('node_yearly')
    async function selectPlanCard () {
      loading.value = true
      try {
        const res = await root.$nuxt.context.$axios.post('/stripe/session', {
          items: [{
            plan: planSelect.value,
            quantity: quantity.value
          }]
        })
        const sessionId = res.data.session_id
        const stripe = await stripePromise
        loading.value = false
        // @ts-ignore
        const { error } = await stripe.redirectToCheckout({
          sessionId
        })
      } catch (e) {
        console.log(e)
        errorMessage.value = 'There was a problem processing request'
      }
      loading.value = false
    }

    async function selectPlanBitcoin () {
      confirmModal.value = false
      btcLoading.value = true
      try {
        const res = await root.$nuxt.context.$axios.post('/btcpay/session', {
          items: [{
            plan: planSelect.value,
            quantity: quantity.value
          }]
        })
        window.location = res.data.redirect_url
      } catch (e) {
        console.log(e)
        errorMessage.value = 'There was a problem processing request'
      }
      btcLoading.value = false
    }

    // @ts-ignore
    function changePlan (event) {
      if (event === 'node_monthly') {
        planSelect.value = 'node_monthly'
        monthlyBill.value = 31.99
        dueToday.value = 31.99 * quantity.value
      } else if (event === 'node_yearly') {
        planSelect.value = 'node_yearly'
        monthlyBill.value = 26.99
        dueToday.value = 323.88 * quantity.value
      }
    }

    function changeQuantity () {
      const defaultDue = (planSelect.value == 'node_yearly') ? defaultDueYearly.value : defaultDueMonthly.value
      const newBill = quantity.value * defaultDue
      dueToday.value = parseFloat(newBill.toFixed(2))
    }

    watch(planSelect, changePlan)

    return {
      errorMessage,
      loading,
      btcLoading,
      selectPlanCard,
      selectPlanBitcoin,
      planSelect,
      monthlyBill,
      dueToday,
      quantity,
      changeQuantity,
      confirmModal
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
