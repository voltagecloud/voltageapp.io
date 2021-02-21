import { defineComponent, createElement, computed, watch, reactive } from '@vue/composition-api'
import NodePasswordInput from '~/components/NodePasswordInput'
import { macaroonStore } from '~/store'
import { MacaroonType, bakeMacaroon } from '~/utils/bakeMacaroon'
import backupMacaroon from '~/utils/backupMacaroon'

const h = createElement

export default defineComponent({
  props: {
    nodeId: {
      type: String,
      required: true
    }
  },
  setup: (props, ctx) => {
    const macaroonState = computed(() => macaroonStore.macaroonState({ nodeId: props.nodeId, type: 'btcpayserver' }))
    const adminMacaroon = computed(() => macaroonStore.macaroonState({ nodeId: props.nodeId, type: 'admin' }))
    const nodeEndpoint = computed(() => macaroonStore.findNodeMeta({ nodeId: props.nodeId }))

    const state = reactive({
      loading: false,
      error: ''
    })

    async function macaroonHandler () {
      const nodeId = props.nodeId
      // we cant do anything with node password
      if (!macaroonState.value.password) return
      state.loading = true
      try {
        // if password exists but macaron not in state try to fetch
        if (!macaroonState.value.encrypted && !macaroonState.value.error) {
          await macaroonStore.FETCH_MACAROON({ nodeId, macaroonType: 'btcpayserver' })
          return
        }
        // if admin macaroon is in state we need to bake a btcpay macaroon
        const endpoint = nodeEndpoint.value?.endpoint
        const macaroonHex = adminMacaroon.value.macaroonHex
        if (macaroonHex && endpoint) {
          const res = await bakeMacaroon({
            endpoint,
            macaroonType: MacaroonType.btcpayserver,
            macaroonHex
          })
          const { macaroon }: { macaroon: string } = await res.json()
          macaroonStore.MACAROON({ nodeId, macaroon, type: 'btcpayserver' })
          // encrypt btcpayserver macaroon and back it up
          await backupMacaroon({
            macaroonText: macaroon,
            macaroonType: 'btcpayserver',
            password: adminMacaroon.value.password,
            nodeId
          })
          ctx.emit('done')
          return
        }

        // if admin macaroon doesnt exist, fetch it
        if (!macaroonHex) {
          await macaroonStore.FETCH_MACAROON({ nodeId, macaroonType: 'admin' })
          return
        }
      } catch (e) {
        state.error = e.message
      } finally {
        state.loading = false
      }
    }

    watch([macaroonState, adminMacaroon], macaroonHandler)

    function writePassword (password: string) {
      macaroonStore.NODE_PASSWORD({ nodeId: props.nodeId, password })
    }

    return () => {
      if (!macaroonState.value.password) {
        return <NodePasswordInput onDone={writePassword} />
      } else if (state.loading || state.error) {
        return <div>
          <v-progress-circular indeterminate />
          <div>{state.error}</div>
        </div>
      }
    }
  }
})

