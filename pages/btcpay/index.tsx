import { defineComponent, createElement } from '@vue/composition-api'
import { VContainer, VRow, VCol, VBtn, VImg, VCard, VCardTitle, VCardActions, VCardText, VProgressCircular } from 'vuetify/lib'
import useFetch from '~/compositions/useFetch'

const h = createElement

export default defineComponent({
  components: {
    VContainer, VCol, VRow, VBtn, VImg, VCard, VCardTitle, VCardActions, VCardText, VProgressCircular
  },
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  setup: (_, { root }) => {
    const { data, loading, dispatch } = useFetch<any>('/btcpayserver')

    dispatch({
      method: 'GET'
    })

    return () => { 
      if (loading.value) {
        return <v-container>
          <v-row>
            <v-col cols="12">
              <v-card class="text-center">
                <v-progress-circular indeterminate />
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      } else if (data.value?.btcpayservers?.length) {
        console.log({ data: data.value })
        return <v-container>
          <v-row>
            {data.value.btcpayservers.map((server: any) => <v-col cols="12">
              <v-card color="info" onClick={() => root.$router.push(`/btcpay/${server.btcpayserver_id}`)}>
                <v-container class="d-flex"> 
                  <div class="flex-grow-1">{server.store_name}</div>
                </v-container>
              </v-card>
            </v-col>)}
          </v-row>
        </v-container>
      } else {
        return <v-container>
          <v-row>
            <v-col cols="12">
              <v-card>
                <v-card-title>
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
                    to="/create/btcpay"
                    color="highlight"
                    class="mx-auto my-3"
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
    }
  }
})

