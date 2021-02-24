import { defineComponent, createElement, reactive } from '@vue/composition-api'
import useFetch from '~/compositions/useFetch'
import { decryptString } from '~/utils/crypto'
import { VProgressCircular } from 'vuetify/lib'

const h = createElement

export default defineComponent({
  components: {
    NodePasswordInput: () => import('~/components/NodePasswordInput.vue'),
    VProgressCircular
  },
  props: {
    serverId: {
      type: String,
      required: true
    }
  },
  setup: (props) => {
    const { loading, data, dispatch } = useFetch<any>('/btcpayserver/seed')

    dispatch({
      method: 'POST',
      body: JSON.stringify({
        btcpayserver_id: props.serverId
      })
    })

    const state = reactive({
      error: '',
      decrypted: ''
    })

    function handleSeed (password: string) {
      const { decrypted, error } = decryptString({ encrypted: data.value.seed, password })
      state.error = error
      state.decrypted = decrypted
    }

    return () => {
      if (loading.value) {
        return <div class="text-center my-4">
          <v-progress-circular indeterminate />
        </div>
      } else if (state.decrypted) {
        return <div class="text-center my-4 white">
          {state.decrypted}
        </div>
      } else if (data.value?.seed) {
        console.log({ data })
        return <node-password-input
          onDone={handleSeed}
          text="Get Seed Backup"
          topText="Enter the password you used to encrpyt your seed"
          error={state.error}
        />
      } else {
        return <div classs="text-center my-4">
          No seed backup is found.
        </div>
      }
    }
  }
})

