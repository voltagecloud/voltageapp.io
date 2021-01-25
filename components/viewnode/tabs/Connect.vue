<template lang="pug">
  v-container
    span(v-if='status !== "running"')
      | You can only connect to a running node. Please turn this node on before connecting
    node-password-input(v-else-if='curStage === 0' @done='')
    show-qr(
      v-model='showQrDialog'
      :connectURI='connectURI'
      :api='apiEndpoint'
      :cert='cert'
      :macaroon='macaroon'
      :pass='pass'
      :grpc='grpc'
      :rest='rest'
      @clear='clearQr'
      @updateApi='buildUri'
    )
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, computed } from '@vue/composition-api'
import { Node } from '~/types/apiResponse'
import useNodeApi from '~/compositions/useNodeApi'

export default defineComponent({
  components: {
    NodePasswordInput: () => import('~/components/NodePasswordInput.vue')
  },
  props: {
    node: {
      type: Object as () => Node,
      required: true
    }
  },
  setup (props, { root }) {
    const { connectNode } = useNodeApi(root.$nuxt.context)

    const state = reactive({
      apiEndpoint: '',
      cert: '',
      encrypted: '',
      error: '',
      macaroon: '',
      validPw: '',
      step: 0,
      connectURI: ''
    })

    async function connect () {
      try {
        const res = await connectNode(props.node.node_id, 'admin')
        const { endpoint, macaroon, tls_cert } = res
        if (macaroon) {
          state.apiEndpoint = endpoint
          state.cert = tls_cert
          state.encrypted = macaroon
        } else {
          // IMPLEMENT MACAROON UPLOAD
        }
      } catch (e) {
        state.error = e.toString()
      }
    }

    function isBase64 (str) {
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
      state.connectURI = (tls_cert)
        ? `lndconnect://${api}:${port}?cert=${tls_cert}&macaroon=${macaroon}`
        : `lndconnect://${api}:${port}?macaroon=${macaroon}`
    }

    function handleConnectNode (password: string, api: string) {
      const port = (api === 'rest') ? '8080' : '10009'
      try {
        const decrypted = crypto.AES.decrypt(state.encrypted || '', password).toString(crypto.enc.Base64)
        const decryptResult = atob(decrypted)
        if (isBase64(decryptResult)) {
          state.macaroon = decryptResult
          buildUri(props.node.api_endpoint, port, '', decryptResult)
          state.step = 2
          state.validPw = password
        } else {
          state.error = 'Incorrect password'
        }
      } catch (e) {
        console.error('cipher mismatch, macaroon decryption failed')
        console.error(e)
        state.error = e.toString()
      }
    }

    function clearQr () {
      showQrDialog.value = false
    }

    const grpc = computed(() => props.node.settings.grpc)
    const rest = computed(() => props.node.settings.rest)

    return {
      connect,
      handleConnectNode,
      clearQr,
      grpc,
      rest,
      ...toRefs(state)
    }
  }
})
</script>
