import { defineComponent, createElement, ref, PropType, computed, reactive } from '@vue/composition-api'
import useDecryptMacaroon from '~/compositions/useDecryptMacaroon'
import { Node } from '~/types/apiResponse'
import { base64ToHex, decryptString } from '~/utils/crypto'
import useNodeApi from '~/compositions/useNodeApi'
import { MacaroonType, bakeMacaroon } from '~/utils/bakeMacaroon'
import backupMacaroon from '~/utils/backupMacaroon'

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
    const { apiEndpoint, password, macaroonHex } = useDecryptMacaroon(ctx, props.node.node_id)

    const state = reactive({
      loading: false,
      error: '',
      rawMacaroon: ''
    })

    const btcpayMac = computed(() => {
      if (state.rawMacaroon) {
        const { decrypted, error } = decryptString({ password: password.value, encrypted: state.rawMacaroon })
        if (error) { state.error = error; return }
        return base64ToHex(decrypted)
      }
      return ''
    })
    const connectionString = computed(() => btcpayMac.value
      ? `type=lnd-rest;server=https://${apiEndpoint.value}:8080/;macaroon=${btcpayMac.value}`
      : ''
    )

    const { connectNode } = useNodeApi(ctx.root.$nuxt.context)
    

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
        const res = await bakeMacaroon({
          endpoint: apiEndpoint.value,
          macaroonHex: macaroonHex.value,
          macaroonType: MacaroonType.btcpayserver
        })
        const json = await res.json()
        state.rawMacaroon = json.macaroon
        state.loading = false
        await backupMacaroon({
          macaroonText: json.macaroon,
          macaroonType: 'btcpayserver',
          nodeId: props.node.node_id,
          password: password.value
        })
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

