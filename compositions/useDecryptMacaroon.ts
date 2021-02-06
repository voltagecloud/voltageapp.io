import { reactive, SetupContext, computed, toRefs } from '@vue/composition-api'
import crypto from 'crypto-js'
import useNodeApi from './useNodeApi'

const state = reactive({
  apiEndpoint: '',
  cert: '',
  encrypted: '',
  error: '',
  macaroon: '',
  nodeId: ''
})

const isMacaroonDecrypted = computed(() => !!state.macaroon)

function base64ToHex (str: string) {
  const raw = atob(str)
  let result = ''
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16)
    result += (hex.length === 2 ? hex : '0' + hex)
  }
  return result.toUpperCase()
}

const macaroonHex = computed(() => state.macaroon ? base64ToHex(state.macaroon) : '')

function isBase64 (str: string) {
  if (str === '' || str.trim() === '') { return false }
  try {
    return btoa(atob(str)) === str
  } catch (err) {
    return false
  }
}

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
  }

  async function decryptMacaroon (
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
    try {
      const decrypted = crypto.AES.decrypt(state.encrypted || '', password).toString(crypto.enc.Base64)
      const decryptResult = atob(decrypted)
      if (isBase64(decryptResult)) {
        state.macaroon = decryptResult
      } else {
        state.error = 'Incorrect password'
      }
    } catch (e) {
      console.error('cipher mismatch, macaroon decryption failed')
      console.error(e)
      state.error = e.toString()
    }
  }

  return {
    decryptMacaroon,
    isMacaroonDecrypted,
    macaroonHex,
    ...toRefs(state)
  }
}
