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
      const needsPurchase = json.available_btcpayservers === 0
        && !json.btcpayserver_trial && !json.btcpayservers.length

      return needsPurchase ? '/purchase' : '/create/btcpay'
    })

    return () => <v-container>
      <v-row>
        <v-col cols="12">
          <v-card color="info">
            <v-card-title class="justify-center">
              <div class="text-center" style="word-break: normal;">Start Accepting Bitcoin Instantly</div>
            </v-card-title>
            <v-card-text>
              <div class="text-center">
                No setup, no waiting, and no transaction fees. The easiest way to start accepting Bitcoin payments both on-chain and on the Lighting Network.
              </div>
              <v-card max-width="275" class="mx-auto my-3">
                <v-container>
                  <v-img
                    src={require('~/assets/btcpay-logo-black-txt.svg')}
                    class="mx-auto"
                    max-height="120"
                    contain
                  />
                </v-container>
              </v-card>
            </v-card-text>
            <v-card-actions class="d-flex flex-column">
              <v-btn
                large
                dark
                to={to.value}
                color="highlight"
                class="mx-auto my-1"
                loading={loading.value}
              >
                Create Your Store
              </v-btn>
              <div class="text-center my-3">
                Includes a 7 day free trial. Plans starting at $6.99 per month.
              </div>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  }
})

