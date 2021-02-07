import { defineComponent, computed, createElement, PropType } from '@vue/composition-api'
import type { Node } from '~/types/apiResponse'
import useDecryptMacaroon from '~/compositions/useDecryptMacaroon'

const h = createElement

export default defineComponent({
  components: {
    NodePasswordInput: () => import('~/components/NodePasswordInput.vue'),
    ShowQr: () => import('~/components/ShowQr')
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true
    }
  },
  setup: (props, ctx) => {
    const grpc = computed(() => props.node.settings.grpc)
    const rest = computed(() => props.node.settings.rest)

    const { isMacaroonDecrypted, handleDecryptMacaroon, error } = useDecryptMacaroon(ctx, props.node.node_id)

    return () => {
      if (props.node.status !== 'running') {
        return <div>You can only connect to a running node. Please turn this node on before connecting</div> 
      } else if (!isMacaroonDecrypted.value) {
        return <node-password-input text="Connect" onDone={(password: string) => handleDecryptMacaroon({ password })}  error={error.value}/>
      } else if (!!isMacaroonDecrypted.value) {
        return <show-qr node={props.node} />
      }
    }
  }
})

