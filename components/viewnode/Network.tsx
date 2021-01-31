import { defineComponent, reactive, computed, ref, watchEffect, createElement } from '@vue/composition-api'
import useDecryptMacaroon from '~/compositions/useDecryptMacaroon'
import { VContainer } from 'vuetify/lib'

const h = createElement

export default defineComponent({
  components: {
    NodePasswordInput: () => import('~/components/NodePasswordInput.vue'),
    JsonTable: () => import('~/components/core/JsonTable'),
    VContainer
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
    const { isMacaroonDecrypted, handleConnectNode, macaroonHex, apiEndpoint, error } = useDecryptMacaroon(ctx, props.nodeId)

    const payload = ref<Record<string, any>>({})

    watchEffect(async () => {
      if (!macaroonHex.value) return
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
            onDone={(password: string) => handleConnectNode({password, api: 'rest' })}
            text={'Decrypt Macaroon'}
            error={error.value}
        />
      } else {
        return <v-container>
          <json-table data={() => payload.value} />
        </v-container>
      }
    }
  }
})

