import { defineComponent, PropType, computed, ref, watchEffect, createElement } from '@vue/composition-api'
import useDecryptMacaroon from '~/compositions/useDecryptMacaroon'
import { VContainer, VBtn } from 'vuetify/lib'
import type { Node } from '~/types/apiResponse'

const h = createElement

export default defineComponent({
  components: {
    NodePasswordInput: () => import('~/components/NodePasswordInput.vue'),
    JsonTable: () => import('~/components/core/JsonTable'),
    VContainer,
    VBtn
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true
    }
  },
  setup: (props, ctx) => {
    const { isMacaroonDecrypted, handleDecryptMacaroon, macaroonHex, apiEndpoint, error } = useDecryptMacaroon(ctx, props.node.node_id)

    const payload = ref<Record<string, any>>({})
    const responseError = ref('') 

    function canFetch () {
      return props.node.status === 'running' && macaroonHex.value
    }

    async function getNetworkInfo () {
      if (!canFetch()) return
      

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

    return () => {
      if (props.node.status !== 'running') {
        return <v-container>
          This not is not running. Your node must be running to retrieve this info
          <v-btn onClick={getNetworkInfo}>Retry</v-btn>
        </v-container>
      } else if (!props.node.settings.rest) {
        return <v-container>
          This node does not have the REST api enabled. You must enable REST to view network information inside Voltage
          <v-btn onClick={getNetworkInfo}>Retry</v-btn>
        </v-container>
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

