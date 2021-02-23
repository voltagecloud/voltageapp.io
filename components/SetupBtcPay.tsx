import { defineComponent, createElement, computed, watch, reactive } from '@vue/composition-api'
import { macaroonStore } from '~/store'
import { MacaroonType, bakeMacaroon } from '~/utils/bakeMacaroon'
import { VProgressCircular, VBtn } from 'vuetify/lib'
import crypto from 'crypto-js'
import { voltageFetch } from '~/utils/fetchClient'

const h = createElement

export default defineComponent({
  components: {
    VProgressCircular,
    NodePasswordInput: () => import('~/components/NodePasswordInput.vue'),
    VBtn
  },
  props: {
    nodeId: {
      type: String,
      required: true
    }
  },
  setup: (props, ctx) => {
    const macaroonState = computed(() => macaroonStore.macaroonState({ nodeId: props.nodeId, type: 'btcpayserver' }))
    const nodeEndpoint = computed(() => macaroonStore.findNodeMeta({ nodeId: props.nodeId }))
    

    const state = reactive({
      loading: false,
      error: '',
      retry: false
    })

    async function handlePassword (password: string) {
      state.retry = false
      const nodeId = props.nodeId
      state.loading = true
      const error = await macaroonStore.FETCH_MACAROON({ nodeId, macaroonType: 'btcpayserver', password })
      state.loading = false
      // handle case where btcpay macaroon doesnt exits yet
      if (error) {
        // coundlt get pay server macaroon, try admin one
        const adminErr = await macaroonStore.FETCH_MACAROON({ nodeId, macaroonType: 'admin' })
        const adminMacaroon = macaroonStore.macaroonState({ nodeId, type: 'admin' })
        if (adminErr) {
          state.error = 'Could not retrieve admin macaroon. Please make sure this node has been initialized'
          return
        }
        const endpoint = nodeEndpoint.value?.endpoint
        const macaroonHex = adminMacaroon.macaroonHex
        const password = macaroonState.value.password
        console.log({ macaroonHex })
        if (macaroonHex && endpoint) {
          const res = await bakeMacaroon({
            endpoint,
            macaroonType: MacaroonType.btcpayserver,
            macaroonHex
          })
          const { macaroon }: { macaroon: string } = await res.json()

          // encrypt btcpayserver macaroon and back it up
          const encrypted = crypto.AES.encrypt(macaroon, password).toString()
          macaroonStore.MACAROON({ nodeId, macaroon: encrypted, type: 'btcpayserver' })
          await voltageFetch('/node/macaroon', {
            method: 'POST',
            body: JSON.stringify({
              node_id: nodeId,
              name: 'btcpayserver',
              macaroon: encrypted
            })
          })
          ctx.emit('done')
        }
      }
      // btc pay macaroon is in store make sure it was decrypted properly
      else if (!macaroonState.value.error) {
        ctx.emit('done')
      // there was an error decrpyting macaroon
      } else {
        state.error = macaroonState.value.error
      }
    }


    return () => {
      if (!macaroonState.value.password || state.retry) {
        return <node-password-input
          onDone={handlePassword}
          topText="Authorize BTCPay Server to communicate with your node"
          text="Enter node password"
        />
      } else if (state.loading || state.error) {
        return <div class="text-center">
          {state.loading && <v-progress-circular indeterminate />}
          <div>Retrieving Macaroons</div>
          {state.error && <div>
            {state.error}
            <v-btn onClick={() => state.retry = true}>Retry</v-btn>
          </div>}
        </div>
      }
    }
  }
})

