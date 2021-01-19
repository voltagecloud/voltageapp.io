<template lang="pug">

v-card.text-center.align-center(style='padding: 20px;')
  p.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
    a(href="https://btcpayserver.org" target="_blank") 
      | BTCPay Server
  div.font-weight-light.text--darken-1.justify-center.align-center(v-if='apiErrorMessage' max-width='800' style='color: #ff0000; padding: 20px;')
    | BTCPay uses the REST API to communicate with your node.
    | You have this API disabled in your node settings.
    | Please enable it to connect with BTCPay.
  p
    | • Go to your Store in BTCPay Server and click 'Settings'<br />
    | • Scroll down to 'Lightning Network Experimental' and select 'Modify' for 'BTC'<br />
    | • Copy and paste the connection string below into BTCPay Server<br />
    | • Click Save
  p(v-if='hasMac')
    | Connection String
  p(v-if='!hasMac')
    | Please generate a macaroon for BTCPay Server first.
  p
  copy-pill(v-if='hasMac' :text='connectionString' color='accent' text-color='warning').text-break
  p.font-weight-light(v-if='hasMac')
    | click to copy
  v-btn(
    v-if='!hasMac'
    color='warning'
    @click='createBtcpayMac'
    :loading='loading'
  ).info--text
    | Create Macaroon
  p
  | {{ error }}
  p
  a(href="https://docs.btcpayserver.org/LightningNetwork/#connecting-your-internal-lightning-node-in-btcpay" target="_blank") BTCPay Server Documentation.
</template>
<script lang="ts">
import axios from 'axios'
import crypto from 'crypto-js'
import { defineComponent, ref, computed, watch } from '@vue/composition-api'
import { Node } from '~/types/apiResponse'
import useNodeApi from '~/compositions/useNodeApi'

export default defineComponent({
  components: {
    CopyPill: () => import('~/components/core/CopyPill.vue')
  },
  props: {
    api: {
      type: String,
      required: true
    },
    macaroon: {
      type: String,
      required: true
    },
    pass: {
      type: String,
      required: true
    },
    rest: {
      type: Boolean,
      required: true
    }
  },
  setup (props, { root, emit }) {
    function clear () {
      emit('clear')
    }
    const macHex = computed(() => base64ToHex(props.macaroon))
    const { connectNode } = useNodeApi(root.$nuxt.context)
    const hasMac = ref(false)
    const loading = ref(false)
    const error = ref('')
    const btcpayMac = ref('')
    const connectionString = ref('')

    function createString (macData: string) {
      return `type=lnd-rest;server=https://${props.api}:8080/;macaroon=${macData}`
    }

    // @ts-ignore
    function base64ToHex (str) {
      const raw = atob(str)
      let result = ''
      for (let i = 0; i < raw.length; i++) {
        const hex = raw.charCodeAt(i).toString(16)
        result += (hex.length === 2 ? hex : '0' + hex)
      }
      return result.toUpperCase()
    }

    // @ts-ignore
    async function getBtcpay () {
      loading.value = true
      try {
        // @ts-ignore
        const res = await connectNode(root.$nuxt.$route.params.id, 'btcpayserver')
        const { macaroon } = res
        if (macaroon) {
          if (macaroon !== '') {
            hasMac.value = true
            const macData = base64ToHex(decryptMacaroon(props.pass, macaroon))
            btcpayMac.value = macData
            // @ts-ignore
            connectionString.value = createString(macData)
          }
        } else {
          // IMPLEMENT MACAROON UPLOAD
        }
        loading.value = false
      } catch (e) {
        error.value = e.toString()
      }
    }
    getBtcpay()

    async function createBtcpayMac () {
      loading.value = true
      try {
        const res = await axios({
          method: 'POST',
          url: `https://${props.api}:8080/v1/macaroon`,
          data: {
            permissions: [
              {
                entity: 'info',
                action: 'read'
              },
              {
                entity: 'address',
                action: 'read'
              },
              {
                entity: 'address',
                action: 'write'
              },
              {
                entity: 'onchain',
                action: 'read'
              },
              {
                entity: 'invoices',
                action: 'read'
              },
              {
                entity: 'invoices',
                action: 'write'
              }
            ]
          },
          headers: {
            'Grpc-Metadata-macaroon': macHex.value
          }
        })
        // @ts-ignore
        const respData = res.data
        const b64ByteMac = hexToBase64(respData.macaroon)
        hasMac.value = true
        btcpayMac.value = base64ToHex(b64ByteMac)
        // @ts-ignore
        connectionString.value = createString(b64ByteMac)
        loading.value = false
        // @ts-ignore
        const encrypted = crypto.AES.encrypt(b64ByteMac, props.pass).toString()
        const { postMacaroon } = useNodeApi(root.$nuxt.context)
        await postMacaroon(root.$nuxt.$route.params.id, 'btcpayserver', encrypted)
      } catch (err) {
        error.value = `${err}`
      } finally {
        loading.value = false
      }
    }

    const apiErrorMessage = ref((!props.rest))

    // @ts-ignore
    function hexToBase64 (str) {
      return btoa(String.fromCharCode.apply(null,
        str.replace(/\r|\n/g, '').replace(/([\da-fA-F]{2}) ?/g, '0x$1 ').replace(/ +$/, '').split(' '))
      )
    }

    // @ts-ignore
    function isBase64 (str) {
      if (str === '' || str.trim() === '') { return false }
      try {
        return btoa(atob(str)) === str
      } catch (err) {
        return false
      }
    }

    function decryptMacaroon (password: string, macaroon: string) {
      try {
        const decrypted = crypto.AES.decrypt(macaroon || '', password).toString(crypto.enc.Base64)
        const decryptResult = atob(decrypted)
        if (isBase64(decryptResult)) {
          return decryptResult
        } else {
          error.value = 'Incorrect password'
          return ''
        }
      } catch (e) {
        console.error('cipher mismatch, macaroon decryption failed')
        console.error(e)
        error.value = e.toString()
        return ''
      }
    }

    // @ts-ignore
    function base64ToHex (str) {
      const raw = atob(str)
      let result = ''
      for (let i = 0; i < raw.length; i++) {
        const hex = raw.charCodeAt(i).toString(16)
        result += (hex.length === 2 ? hex : '0' + hex)
      }
      return result.toUpperCase()
    }

    return {
      clear,
      apiErrorMessage,
      createBtcpayMac,
      connectionString,
      hasMac,
      loading,
      error
    }
  }
})
</script>
