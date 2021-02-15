import { defineComponent, reactive, computed, ref, watchEffect, createElement } from '@vue/composition-api'
import useDecryptMacaroon from '~/compositions/useDecryptMacaroon'
import { VContainer, VBtn } from 'vuetify/lib'

const h = createElement

export default defineComponent({
  components: {
    NodePasswordInput: () => import('~/components/NodePasswordInput.vue'),
    JsonTable: () => import('~/components/core/JsonTable'),
    VContainer,
    VBtn
  },
  props: {
    enabledREST: {
      type: Boolean,
      required: true
    },
    nodeId: {
      type: String,
      required: true
    }
  },
  setup: (props, ctx) => {
    const { isMacaroonDecrypted, handleDecryptMacaroon, macaroonHex, apiEndpoint, error } = useDecryptMacaroon(ctx, props.nodeId)

    const payload = ref<Record<string, any>>({})
    const responseError = ref('') 

    async function getNetworkInfo () {
      if (!macaroonHex.value) return

      try {
        const res = await fetch(`https://${apiEndpoint.value}:8080/v1/getinfo`, {
          method: 'GET',
          headers: new Headers({
            'Grpc-Metadata-macaroon': macaroonHex.value,
            'Content-Type': 'application/json'
          })
        })
        const json = await res.json()
        payload.value = {
          'Identity Pubkey': json.identity_pubkey,
          Alias: json.alias,
          Color: json.color,
          'Pending Channels': json.num_pending_channels,
          'Active Channels': json.num_active_channels,
          'Inactive Channels': json.num_inactive_channels,
          Peers: json.num_peers,
          'Block Height': json.block_height,
          'Synced to Chain': json.synced_to_chain,
          'Synced to Graph': json.synced_to_graph,
          URIs: json.uris
        }
        console.log({ json })
      } catch (e) {
        responseError.value = e.message
      }
    }

    watchEffect(async () => {
      if (!macaroonHex.value) return
      await getNetworkInfo()
    })

    const normalizedPayload = computed(() => {
      if (payload.value.keys().length === 0) return []
      const { chains, uris, features, ...simpleKeys } = payload.value
      return Object.entries(simpleKeys).map(([key, value]) => ({
        key: key as string,
        value: value as string
      }))
    })

    return () => {
      if (!props.enabledREST) {
        return <div>
          This node does not have the REST api enabled. You must enable REST to view network information inside Voltage
        </div>
      } else if (!isMacaroonDecrypted.value) {
        return <node-password-input
            onDone={(password: string) => handleDecryptMacaroon({ password })}
            text={'Decrypt Macaroon'}
            error={error.value}
        />
      } else if (Object.keys(payload.value).length > 0) {
        return <v-container>
          <json-table data={() => payload.value} />
        </v-container>
      } else if (responseError.value) {
        return <v-container class="text-center">
          <div>{ responseError.value }</div>
          <div>Failed to fetch information from LND. Please make sure you have your current IP whitelisted in the node's settings</div>
          <v-btn onClick={getNetworkInfo}>Retry</v-btn>
        </v-container>
      }
    }
  }
})

