import { reactive, SetupContext, computed, toRefs } from '@vue/composition-api'
import useNodeApi from './useNodeApi'
import { base64ToHex, decryptMacaroon } from '~/utils/crypto'

const state = reactive({
  apiEndpoint: '',
  cert: '',
  encrypted: '',
  error: '',
  macaroon: '',
  nodeId: '',
  password: ''
})

const isMacaroonDecrypted = computed(() => !!state.macaroon)

const macaroonHex = computed(() => state.macaroon ? base64ToHex(state.macaroon) : '')

export default function useDecryptMacaroon ({ root }: SetupContext, nodeId: string) {
  const { connectNode } = useNodeApi(root.$nuxt.context)

  // nodeId is unique key and should invalidate global state when new one is passed
  if (nodeId !== state.nodeId) {
    state.nodeId = nodeId
    state.encrypted = ''
    state.macaroon = ''
    state.apiEndpoint = ''
    state.error = ''
    state.cert = ''
    state.password = ''
  }

  async function handleDecryptMacaroon (
    { password }:
    { password: string; }
  ) {
    // get encrypted macaroon from api
    try {
      const res = await connectNode(nodeId, 'admin')
      if (!res) {
        state.error = 'An error occured while retrieving your macaroon'
        return
      }
      const { endpoint, macaroon, tls_cert } = res
      if (macaroon) {
        state.apiEndpoint = endpoint
        state.cert = tls_cert
        state.encrypted = macaroon
      } else {
        state.error = 'An error occured while retrieving your macaroon'
        return
        // IMPLEMENT MACAROON UPLOAD
      }
    } catch (e) {
      state.error = e.toString()
      return
    }
    // attempt to decrypt macaroon
    const { macaroon: decrypted, error } = decryptMacaroon({ password, encrypted: state.encrypted })
    state.macaroon = decrypted
    state.error = error
    state.password = error ? '' : password
  }

  return {
    handleDecryptMacaroon,
    isMacaroonDecrypted,
    macaroonHex,
    ...toRefs(state)
  }
}
