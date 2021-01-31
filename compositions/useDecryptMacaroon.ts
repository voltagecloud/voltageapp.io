import { reactive, SetupContext, computed, toRefs } from '@vue/composition-api'
import crypto from 'crypto-js'
import useNodeApi from './useNodeApi'

const state = reactive({
  apiEndpoint: '',
  cert: '',
  encrypted: '',
  error: '',
  macaroon: '',
  connectURI: '',
  pass: '',
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

// convert b64 to b64url
function safeUrl (data: string) {
  data = data.replace(/\+/g, '-')
  data = data.replace(/\//g, '_')
  data = data.replace(/=/g, '')
  return data
}

function buildUri (api: string, port: string, tls_cert: string, macaroon: string) {
  macaroon = safeUrl(macaroon)
  return (tls_cert)
    ? `lndconnect://${api}:${port}?cert=${tls_cert}&macaroon=${macaroon}`
    : `lndconnect://${api}:${port}?macaroon=${macaroon}`
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
    state.connectURI = ''
    state.pass = ''
    state.cert = ''
  }

  async function handleConnectNode (
    { password, api }:
    { password: string; api: string; }
  ) {
    // get encrypted macaroon from api
    try {
      const res = await connectNode(nodeId, 'admin')
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
    }
    const port = (api === 'rest') ? '8080' : '10009'
    // attempt to decrypt macaroon
    try {
      const decrypted = crypto.AES.decrypt(state.encrypted || '', password).toString(crypto.enc.Base64)
      const decryptResult = atob(decrypted)
      if (isBase64(decryptResult)) {
        state.macaroon = decryptResult
        state.connectURI = buildUri(state.apiEndpoint, port, '', decryptResult)
        state.pass = password
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
    handleConnectNode,
    isMacaroonDecrypted,
    buildUri,
    macaroonHex,
    ...toRefs(state)
  }
}
