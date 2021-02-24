import { defineComponent, createElement, computed } from '@vue/composition-api'
import { authStore } from '~/store'
import useFetch from '~/compositions/useFetch'
import { VContainer, VRow, VCol, VCard, VCardTitle, VCardText, VCardActions, VImg, VBtn } from 'vuetify/lib'

const h = createElement

export default defineComponent({
  components: {
    VContainer, VRow, VCol, VCard, VCardTitle, VCardText, VCardActions, VImg, VBtn 
  },
  setup: () => {
    const { loading, data, dispatch } = useFetch<any>('/user')

    dispatch({ method: 'GET' })

    const to = computed(() => {
      if (!data.value?.user_id) return ''
      const json = data.value
      const needsPurchase = json.available_btcpayserver === 0
        && !json.btcpayserver_trial && !json.btcpayservers.length

      return needsPurchase ? '/purchase' : '/create/btcpay'
    })

    return () => <v-container>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="justify-center">
              <div class="text-center">Start Accepting Bitcoin Instantly</div>
            </v-card-title>
            <v-card-text>
              <div class="text-center">
                No setup, no waiting, and no KYC. The easiest way to start accepting Bitcoin payments both on chain and on the Lighting Network.
              </div>
              <v-img
                src={require('~/assets/btcpay-logo.png')}
                class="mx-auto"
                max-height="250"
                contain
              />
            </v-card-text>
            <v-card-actions class="d-flex flex-column">
              <v-btn
                large
                dark
                to={to.value}
                color="highlight"
                class="mx-auto my-3"
                loading={loading.value}
              >
                Create Store
              </v-btn>
              <div class="text-center my-3">Free for 7 days then $7.99/month on a 1 year plan</div>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  }
})

