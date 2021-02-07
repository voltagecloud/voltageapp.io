import { defineComponent, createElement, PropType, computed } from '@vue/composition-api'
import type { Node } from '~/types/apiResponse'
import useDecryptMacaroon from '~/compositions/useDecryptMacaroon'

const h = createElement

export default defineComponent({
  components: {
    VContainer: () => import('vuetify/lib').then(m => m.VContainer)
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true
    }
  },
  setup: (props, ctx) => {
    const { macaroon, apiEndpoint } = useDecryptMacaroon(ctx, props.node.node_id)
    const nodename = computed(() => apiEndpoint.value.split('.')[0])

    return () => <v-container class="text-center">
      <p class="font-weight-light text--darken-1 v-card__title justify-center align-center">
        <a href="https://thunderhub.io" target="_blank">
          ThunderHub
        </a>
      </p>
      { !props.node.settings.grpc
        ? (<div
           class="font-weight-light text--darken-1 justify-center align-center"
           max-width="800"
           style="color: #ff0000; padding: 20px;"
         >
          ThunderHub uses gRPC to communicate with your node.
          You have this API disabled in your node settings.
          Please enable it to connect with ThunderHub
        </div>)
        : (<div>
          <p>To connect with ThunderHub, copy and paste the follow contents into your Account Config file.</p>
          <div>Account Config File:</div>
          <pre
            style="text-align: left; overflow: scroll; white-space: pre; background-color: #505050; font-family: monospace; color: #ffffff; border-radius: 5px; padding: 10px; max-width: 85%; margin: auto;"
          >
              masterPassword: somerandompassword
              accounts:
              - name: '{ nodename.value }'
              serverUrl: '{ apiEndpoint.value }:10009'
              macaroon: '{ macaroon.value }'
          </pre>
        </div>)
      }
      <a href="https://github.com/apotdevin/thunderhub#server-accounts" target="_blank">ThunderHub Documentation.</a>
    </v-container>
  }
})

