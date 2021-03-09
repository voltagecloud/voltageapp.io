import { defineComponent } from '@vue/composition-api'
import { VContainer, VRow, VCol, VCard, VProgressCircular } from 'vuetify/lib'
import useFetch from '~/compositions/useFetch'
import BTCPayLandingCard from '~/components/BTCPayLandingCard'

export default defineComponent({
  components: {
    VContainer, VCol, VRow, VCard, VProgressCircular
  },
  setup: (_, { root }) => {
    const { data, loading, dispatch } = useFetch<any>('/btcpayserver')

    dispatch({
      method: 'GET'
    })


    return () => { 
      if (loading.value) {
        return <v-container class="text-center">
          <v-progress-circular indeterminate />
        </v-container>
      } else if (data.value?.btcpayservers?.length) {
        root.$router.push(`/btcpay/${data.value.btcpayservers[0].btcpayserver_id}`)
        return
        // code for rendering individual stores
        // disabled for now since there can only be 1 store
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

