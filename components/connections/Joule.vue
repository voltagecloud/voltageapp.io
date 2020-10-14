<template lang="pug">

v-card.text-center.align-center(style='padding: 20px;')
  p.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
    a(href="https://lightningjoule.com" target="_blank") 
      | Joule
  div.font-weight-light.text--darken-1.justify-center.align-center(v-if='apiErrorMessage' max-width='800' style='color: #ff0000; padding: 20px;')
    | Joule uses the REST API to communicate with your node.
    | You have this API disabled in your node settings.
    | Please enable it to connect with Joule.
  p
    | • Click the 'Get Started' button in Joule. Then select 'Remote Node'.<br />
    | • Copy the Node URL below and paste it into the 'Node URL' field in Joule.<br />
    | • Upload or paste both the Admin macaroon and a Readonly macaroon. Click 'Continue'.<br />
    | • Create a password for Joule when prompted.
  p
  | Node URL
  p
  copy-pill(:text='"https://" + api + ":8080"' color='accent' text-color='warning').text-break
  p.font-weight-light
    | click to copy
  p.text--darken-1.v-card__title.justify-center.align-center
    | Admin Macaroon
  v-btn(
    color='warning'
    text-color='highlight'
    :href='"data:application/text-plain;base64,"+macaroon'
    download='admin.macaroon'
    title='admin.macaroon'
  ).info--text
    | Download Macaroon
  p
  | Hex:
  p
  copy-pill(:text='macHex' color='accent' text-color='warning').text-break
  p.font-weight-light
    | click to copy
  p.text--darken-1.v-card__title.justify-center.align-center
    | Readonly Macaroon
  v-btn(
    v-if='hasReadonly'
    color='warning'
    :href='"data:application/octet-stream;base64,"+readonlyMac'
    download='readonly.macaroon'
    title='readonly.macaroon'
    :loading='loading'
  ).info--text
    | Download Macaroon
  v-btn(
    v-if='!hasReadonly'
    color='warning'
    @click='createReadonlyMac'
    :loading='loading'
  ).info--text
    | Create Macaroon
  p
  | {{ error }}
  p
  | Hex:
  p
  copy-pill(:text='readonlyMacHex' color='accent' text-color='warning').text-break
  p.font-weight-light
    | click to copy
  p
  a(href="https://lightningjoule.com/faq" target="_blank") Joule Documentation.
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
    const hasReadonly = ref(false)
    const loading = ref(false)
    const error = ref('')
    const readonlyMac = ref('')
    const readonlyMacHex = ref('pending')

    // @ts-ignore
    async function getReadonly () {
      loading.value = true
      try {
        // @ts-ignore
        const res = await connectNode(root.$nuxt.$route.params.id, 'readonly')
        const { macaroon } = res
        if (macaroon) {
          if (macaroon !== '') {
            hasReadonly.value = true
            const macData = decryptMacaroon(props.pass, macaroon)
            readonlyMac.value = macData
            readonlyMacHex.value = base64ToHex(macData)
          }
        } else {
          // IMPLEMENT MACAROON UPLOAD
        }
        loading.value = false
      } catch (e) {
        error.value = e.toString()
      }
    }
    getReadonly()

    async function createReadonlyMac () {
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
                entity: 'peers',
                action: 'read'
              },
              {
                entity: 'message',
                action: 'read'
              },
              {
                entity: 'address',
                action: 'read'
              },
              {
                entity: 'offchain',
                action: 'read'
              },
              {
                entity: 'onchain',
                action: 'read'
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
        hasReadonly.value = true
        readonlyMac.value = b64ByteMac
        readonlyMacHex.value = respData.macaroon.toUpperCase()
        loading.value = false
        // @ts-ignore
        const encrypted = crypto.AES.encrypt(b64ByteMac, props.pass).toString()
        const { postMacaroon } = useNodeApi(root.$nuxt.context)
        await postMacaroon(root.$nuxt.$route.params.id, 'readonly', encrypted)
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
      macHex,
      apiErrorMessage,
      createReadonlyMac,
      hasReadonly,
      readonlyMac,
      readonlyMacHex,
      loading,
      error
    }
  }
})
</script>
