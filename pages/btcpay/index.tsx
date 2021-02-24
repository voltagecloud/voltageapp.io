import { defineComponent, createElement } from '@vue/composition-api'
import { VContainer, VRow, VCol, VCard, VProgressCircular } from 'vuetify/lib'
import useFetch from '~/compositions/useFetch'
import BTCPayLandingCard from '~/components/BTCPayLandingCard'

const h = createElement

export default defineComponent({
  components: {
    VContainer, VCol, VRow, VCard, VProgressCircular
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
      } else if (!data.value?.btcpayservers?.length) {
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
        return <BTCPayLandingCard />
      }
    }
  }
})

