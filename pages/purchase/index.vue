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
        p
          | Due Today: ${{ dueToday }}
        v-row(align='center' justify='center')
          v-container(style='max-width: 30%;')
            v-btn.px-4.info--text(block='' @click='selectPlanCard' color='highlight')
              | Purchase Node with Card
        v-row(align='center' justify='center')
          v-container(style='max-width: 30%;')
            v-btn.px-4.info--text(block='' @click='selectPlanBitcoin' color='highlight')
              | Purchase Node with Bitcoin
</template>
<script lang="ts">
import { defineComponent, SetupContext, reactive, computed, ref, watch } from '@vue/composition-api'
import { Network } from '~/types/api'
import axios from 'axios'
import useNodeApi from '~/compositions/useNodeApi'
import { loadStripe } from '@stripe/stripe-js';

export default defineComponent({
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  setup (_, { root }) {
    const { getPurchaseSession, loading } = useNodeApi(root.$nuxt.context)
    const stripeKey = process.env.stripeKey
    // @ts-ignore
    const stripePromise = loadStripe(stripeKey)
    const monthlyBill = ref('24.99')
    const dueToday = ref('299.88')
    const planSelect = ref('node_yearly')
    async function selectPlanCard() {
      loading.value = true
      const res = await root.$nuxt.context.$axios.post('/stripe/session', {
        plan: planSelect.value,
        quantity: 1
      })
      const sessionId = res.data.session_id
      const stripe = await stripePromise;
      // @ts-ignore
      const { error } = await stripe.redirectToCheckout({
        sessionId
      });
    }
    /*
    async function selectPlanBitcoin() {
      const opennode = require('opennode');
      opennode.setCredentials('db10e152-e5d5-4d79-bda2-11f33009aad7', 'dev');

      const charge = {
        description: 'Voltage Node',
        amount: 29.99,
        currency: 'USD',
        order_id: '823320',
        customer_name: 'John Doe',
        customer_email: 'me@johndoe.com',
        notif_email: 'me@johndoe.com',
        callback_url: "https://example.com/webhook/opennode",
        success_url: 'https://example.com/order/abc123',
        auto_settle: false
      };

      opennode.createCharge(charge)
          .then(charge => {
              console.log(charge);
          })
          .catch(error => {
              console.error(`${error.status} | ${error.message}`);
          });
          }
    */

    // @ts-ignore
    function changePlan (event) {
      if (event === 'node_monthly') {
        planSelect.value = 'node_monthly'
        monthlyBill.value = '29.99'
        dueToday.value = '29.99'
      } else if (event === 'node_yearly') {
        planSelect.value = 'node_yearly'
        monthlyBill.value = '24.99'
        dueToday.value = '299.88'
      }
    }

    watch(planSelect, changePlan)

    return {
      selectPlanCard,
      planSelect,
      monthlyBill,
      dueToday
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
