<template lang="pug">
  v-container(style='max-width: 95%')
    v-row(align='center' justify='center')
      v-card(style='width: 98%;')
        div(style='padding-top: 10px; padding-bottom: 10px;').text-center
          v-card-text.font-weight-light.text--darken-1.v-card__title.justify-center.align-center.display-1
            | Purchase Lightning Nodes
      v-col(cols='14' lg='8')
        v-card(height='550px')
          div.text-center
            v-card-text.font-weight-light.text--darken-1.v-card__title.h1
              | Choose a Plan
            div(justify='center' align='center' style='margin: auto; padding-botton: 20px;')
              v-row(style='max-width: 100%;')
                v-col(cols='12' lg='12')
                  v-btn(fab icon tile raised elevation="6" value='lite-year' @click='choosePlan' :style='((chosenPlan == "lite-year") ? "border: solid; border-color: #1d437b; background: #ffffff;" : "background: #e4e4e4;") + " border-radius: 5px;  width: 100%; height: 75px; padding-right: 10px; padding-left: 10px;"')
                    | Lite Node/1 Year
                    v-spacer
                    | ${{liteYearCost}}
                    p(justify='center' align='center' style='margin: auto; font-size: 7px;') /mo
                v-col(cols='12' lg='12')
                  v-btn(fab icon tile raised elevation="6" value='lite-month' @click='choosePlan' :style='((chosenPlan == "lite-month") ? "border: solid; border-color: #1d437b; background: #ffffff;" : "background: #e4e4e4;") + " border-radius: 5px;  width: 100%; height: 75px; padding-right: 10px; padding-left: 10px;"')
                    | Lite Node/1 Month         
                    v-spacer
                    | ${{liteMonthCost}}
                    p(justify='center' align='center' style='margin: auto; font-size: 7px;') /mo
                v-col(cols='12' lg='12')
                  hr(style="padding-bottom: 20px; border-left: 0px; border-right: 0px;")
                  v-btn(fab icon tile raised elevation="6" value='standard-year' @click='choosePlan' :style='((chosenPlan == "standard-year") ? "border: solid; border-color: #1d437b; background: #ffffff;" : "background: #e4e4e4;") + " border-radius: 5px;  width: 100%; height: 75px; padding-right: 10px; padding-left: 10px;"')
                    | Standard Node/1 Year           
                    v-spacer
                    | ${{standardYearCost}}
                    p(justify='center' align='center' style='margin: auto; font-size: 7px;') /mo
                v-col(cols='12' lg='12')
                  v-btn(fab icon tile raised elevation="6" value='standard-month' @click='choosePlan' :style='((chosenPlan == "standard-month") ? "border: solid; border-color: #1d437b; background: #ffffff;" : "background: #e4e4e4;") + " border-radius: 5px;  width: 100%; height: 75px; padding-right: 10px; padding-left: 10px;"')
                    | Standard Node/1 Month           
                    v-spacer
                    | ${{standardMonthCost}}
                    p(justify='center' align='center' style='margin: auto; font-size: 7px;') /mo
      v-col(cols='12' lg='4')
        v-card(height='565px')
          div(style='padding: 10px;')
            v-card-text.font-weight-light.text--darken-1.v-card__title.justify-center.align-center.h1
              | Order Details
            div(style="padding: 10px;" class="d-flex justify-space-between")
              p(style="font-size: 20px;") {{planName}}
              v-spacer
              p(style="font-size: 18px;") ${{planPrice}}/mo
            div(style="padding: 10px;")
              p(style="font-size: 20px;") Description
              p(style="font-size: 14px;") {{planDescription}}
            div(style="padding: 10px;" class="d-flex justify-space-between")
              p(style="font-size: 20px;") Node Quantity:
              v-spacer
              input(v-model="quantity" style='max-width: 75px; font-size: 20px; border: 1px solid #a6a6a6; border-radius: 3px;' type="number" pattern="[0-9]*" min='1' :required='true' @click='changeQuantity').text-center
            v-divider
            br
            div(style="padding: 10px;" class="d-flex justify-space-between")
              p(style="font-size: 20px;") Total
              v-spacer
              p(style="font-size: 18px;") <b>${{ dueToday }}</b>

            v-row
              v-container(align='center' justify='center')
                v-btn.px-4.info--text(@click='selectPlanCard' :loading='loading' color='highlight' style="width: 100%")
                  | Purchase with Card
            v-row
              v-container(align='center' justify='center')
                v-btn.px-4.info--text(@click='(planSelect == "node_monthly") ? confirmModal = true : selectPlanBitcoin()' :loading='btcLoading' color='highlight' style="width: 100%;")
                  | Purchase with Bitcoin
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
import { layoutStore } from '~/store'
import useNodeApi from '~/compositions/useNodeApi'

export default defineComponent({
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  setup (_, { root }) {
    layoutStore.DRAWER(false)
    document.addEventListener('focusout', (e) => { changeQuantity() })
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
    const planDescriptions = {
      'lite-year': 'One year of hosting for a Lightning node backend by Neutrino. Ideal for personal wallets or testing purposes.',
      'lite-month': 'One month of hosting for a Lightning node backend by Neutrino. Ideal for personal wallets or testing purposes.',
      'standard-year': 'One year of hosting for a Lightning node backend by a Bitcoin full node. Recommended option for anything outside of a personal wallet.',
      'standard-month': 'One month of hosting for a Lightning node backend by a Bitcoin full node. Recommended option for anything outside of a personal wallet.'
    }
    const planNames = {
      'lite-year': 'Lite Node/1 Year',
      'lite-month': 'Lite Node/1 Month',
      'standard-year': 'Standard Node/1 Year',
      'standard-month': 'Standard Node/1 Month'
    }
    const planPrices = {
      'lite-year': 9.99,
      'lite-month': 12.99,
      'standard-year': 26.99,
      'standard-month': 31.99
    }
    const chosenPlan = ref('standard-year')
    const chosenType = ref('standard')
    const planSelect = ref('node_yearly')
    // @ts-ignore
    const planDescription = ref(planDescriptions['standard-year'])
    const planName = ref(planNames['standard-year'])
    const planPrice = ref(planPrices['standard-year'])
    const liteYearCost = ref(planPrices['lite-year'])
    const liteMonthCost = ref(planPrices['lite-month'])
    const standardYearCost = ref(planPrices['standard-year'])
    const standardMonthCost = ref(planPrices['standard-month'])
    const dueToday = ref(standardYearCost.value * 12)


    async function selectPlanCard () {
      loading.value = true
      try {
        const res = await root.$nuxt.context.$axios.post('/stripe/session', {
          items: [{
            plan: planSelect.value,
            quantity: quantity.value,
            type: chosenType.value
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
            quantity: quantity.value,
            type: chosenType.value
          }]
        })
        window.location = res.data.redirect_url
      } catch (e) {
        console.log(e)
        errorMessage.value = 'There was a problem processing request'
      }
      btcLoading.value = false
    }

    function choosePlan (event: any) {
      chosenPlan.value = event.currentTarget.getAttribute('value')
      // @ts-ignore
      planDescription.value = planDescriptions[chosenPlan.value]
      // @ts-ignore
      planName.value = planNames[chosenPlan.value]
      // @ts-ignore
      planPrice.value = planPrices[chosenPlan.value]
      if (chosenPlan.value.startsWith('lite')) {
        chosenType.value = "lite"
      } else {
        chosenType.value = "standard"
      }
      if (chosenPlan.value.endsWith('month')) {
        planSelect.value = "node_monthly"
        // @ts-ignore
        dueToday.value = planPrices[chosenPlan.value] * quantity.value
      } else {
        planSelect.value = "node_yearly"
        // @ts-ignore
        dueToday.value = (planPrices[chosenPlan.value] * quantity.value) * 12
      }
    }

    function changeQuantity () {
      if (chosenPlan.value.endsWith('month')) {
        // @ts-ignore
        dueToday.value = planPrices[chosenPlan.value] * quantity.value
      } else {
        // @ts-ignore
        dueToday.value = (planPrices[chosenPlan.value] * quantity.value) * 12
      }
    }

    return {
      errorMessage,
      loading,
      btcLoading,
      selectPlanCard,
      selectPlanBitcoin,
      planSelect,
      dueToday,
      quantity,
      confirmModal,
      changeQuantity,
      planDescription,
      planName,
      planPrice,
      chosenType,
      chosenPlan,
      choosePlan,
      liteYearCost,
      liteMonthCost,
      standardYearCost,
      standardMonthCost
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
