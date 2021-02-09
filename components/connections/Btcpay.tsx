import { defineComponent, createElement, ref, PropType, computed, reactive } from '@vue/composition-api'
import useBuildUri from '~/compositions/useBuildUri'
import useDecryptMacaroon from '~/compositions/useDecryptMacaroon'
import { Node } from '~/types/apiResponse'
import {base64ToHex, decryptMacaroon} from '~/utils/crypto'
import useNodeApi from '~/compositions/useNodeApi'
import axios from 'axios'
import crypto from 'crypto-js'

const h = createElement

export default defineComponent({
  components: {
    CopyPill: () => import('~/components/core/CopyPill.vue'),
    QrcodeVue: () => import('qrcode.vue'),
    VContainer: () => import('vuetify/lib').then(m => m.VContainer),
    VBtn: () => import('vuetify/lib').then(m => m.VBtn)
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true
    }
  },
  setup: (props, ctx) => {
    const { macaroon, apiEndpoint, password, macaroonHex } = useDecryptMacaroon(ctx, props.node.node_id)
    const { uri } = useBuildUri({
      endpoint: apiEndpoint,
      macaroon,
      cert: ref(false),
      api: ref('GRPC')
    })

    const state = reactive({
      loading: false,
      error: '',
      rawMacaroon: ''
    })

    const btcpayMac = computed(() => {
      if (state.rawMacaroon) {
        const { macaroon, error } = decryptMacaroon({ password: password.value, encrypted: state.rawMacaroon })
        if (error) { state.error = error; return }
        return base64ToHex(macaroon)
      }
      return ''
    })
    const connectionString = computed(() => btcpayMac.value
      ? `type=lnd-rest;server=https://${apiEndpoint.value}:8080/;macaroon=${btcpayMac.value}`
      : ''
    )

    const { connectNode, postMacaroon } = useNodeApi(ctx.root.$nuxt.context)
    

    async function getMac () {
      state.loading = true
      try {
        const { macaroon } = await connectNode(props.node.node_id, 'btcpayserver')
        state.rawMacaroon = macaroon
      } catch (e) {
        state.error = e.toString()
      }
      finally {
        state.loading = false
      }
    }
    getMac()


    async function createBtcpayMac () {
      state.loading = true
      try {
        const res = await axios({
          method: 'POST',
          url: `https://${apiEndpoint.value}:8080/v1/macaroon`,
          data: {
            permissions: [
              {
                entity: 'info',
                action: 'read'
              },
              {
                entity: 'address',
                action: 'read'
              },
              {
                entity: 'address',
                action: 'write'
              },
              {
                entity: 'onchain',
                action: 'read'
              },
              {
                entity: 'invoices',
                action: 'read'
              },
              {
                entity: 'invoices',
                action: 'write'
              }
            ]
          },
          headers: {
            'Grpc-Metadata-macaroon': macaroonHex.value
          }
        })
        state.rawMacaroon = res.data.macaroon
        state.loading = false
        const encrypted = crypto.AES.encrypt(res.data.macaroon, password.value).toString()
        await postMacaroon(props.node.node_id, 'btcpayserver', encrypted)
      } catch (err) {
        state.error = `${err}`
      } finally {
        state.loading = false
      }
    }

    return () => <v-container class="text-center">
      <p class="font-weight-light text--darken-1 v-card__title justify-center align-center">
        <a href="https://btcpayserver.org" target="_blank">
          BTCPay Server
        </a>
      </p>
      { !props.node.settings.rest
       ? (<div>
        <div
          class="font-weight-light text--darken-1 justify-center align-center"
          max-width="800"
          style="color: #ff0000; padding: 20px;"
        >
          BTCPay uses the REST API to communicate with your node.
          You have this API disabled in your node settings.
          Please enable it to connect with BTCPay
        </div>
        <ul>
          <li>Go to your Store in BTCPay Server and click 'Settings'</li>
          <li>Scroll down to 'Lightning Network Experimental' and select 'Modify' for 'BTC'</li>
          <li>Copy and paste the connection string below into BTCPay Server</li>
          <li>Click Save</li>
        </ul>
       </div>)
       : (<div>
       </div>)
      }
      { btcpayMac.value
        ? (<div>
          <p>Connection String</p>
          <copy-pill class="text-break" text={connectionString.value} color="accent" text-color="warning" />
          <p class="font-weight-light">click to copy</p>
        </div>)
        : (<div>
          <p>Please generate a macaroon for BTCPay Server first.</p>
          <v-btn class="info--text" color="warning" onClick={createBtcpayMac} loading={state.loading}>Create Macaroon</v-btn>
        </div>)
      }
      <div>{ state.error }</div>
      <a href="https://docs.btcpayserver.org/LightningNetwork/#connecting-your-internal-lightning-node-in-btcpay" target="_blank">BTCPay Server Documentation.</a>
    </v-container>
  }
})

