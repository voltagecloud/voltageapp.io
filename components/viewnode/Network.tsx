import { defineComponent, reactive, computed, ref, watchEffect, createElement } from '@vue/composition-api'
import useDecryptMacaroon from '~/compositions/useDecryptMacaroon'

const h = createElement

export default defineComponent({
  components: {
    NodePasswordInput: () => import('~/components/NodePasswordInput.vue')
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

    const payload = ref('')

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
      payload.value = JSON.stringify(json)
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
        return <div>{payload.value}</div>
      }
    }
  }
})

