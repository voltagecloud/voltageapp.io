<template lang="pug">
    v-container
        v-card(color='info')
            div(style='padding: 20px;').text-center
                v-card-text.highlight--text.display-1 Lightning Node
                div.text-center.warning--text.mb-6
                  | Create your own Lightning Node for Mainnet or Testnet that never expires. Provision and connect to your node in less than two minutes.
                v-container
                  v-row.no-gutters
                    v-col(cols='12' md='6')
                      v-card(class='pa-2').outlined
                        v-btn.px-4.info--text(block='' @click='selectPlan' color='highlight' large='')
                          | Buy Node
                  v-row.no-gutters
                    v-col(cols='12' md='6')
                      v-card(class='pa-2').outlined
                        | node 2
                  v-row.no-gutters
                    v-col(cols='12' md='6')
                      v-card(class='pa-2').outlined
                        v-btn.px-4.info--text(block='' @click='portal' color='highlight' large='')
                          | Portal


</template>
<script lang="ts">
import { defineComponent, reactive, computed, ref } from '@vue/composition-api'
import { nodeStore, createStore } from '~/store'
import { Network } from '~/types/api'
import axios from 'axios'
import useNodeApi from '~/compositions/useNodeApi'
import { loadStripe } from '@stripe/stripe-js';

export default defineComponent({
  setup (_, { root }) {
    console.log("ROOOOTTT")
    console.log(root)
    console.log(root.$route.query)
    if ('session_id' in root.$route.query && root.$route.query.session_id != "") {
      console.log("It's set!!")
    } else {
      console.log("nope")
    }
    const { getPurchaseSession, loading } = useNodeApi(root.$nuxt.context)
    const stripeKey = process.env.stripeKey
    // @ts-ignore
    const stripePromise = loadStripe(stripeKey)
    async function selectPlan() {
      loading.value = true
      const res = await root.$nuxt.context.$axios.post('/stripe/session', {
        plan: 'node_monthly',
        quantity: 1
      })
      console.log(res)
      const sessionId = res.data.session_id
      const stripe = await stripePromise;
      // @ts-ignore
      const { error } = await stripe.redirectToCheckout({
        sessionId
      });
    }

    async function portal() {
      loading.value = true
      const res = await root.$nuxt.context.$axios.post('/stripe/portal', {})
      console.log(res)
      const portalUrl = res.data.portal_url
      window.location.replace(portalUrl)
    }

    return {
      selectPlan,
      portal
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
