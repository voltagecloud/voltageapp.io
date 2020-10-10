<template lang="pug">

v-card.text-center.align-center(style='padding: 20px;')
  p.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
    | Zeus
  div.font-weight-light.text--darken-1.justify-center.align-center(v-if='!rest' max-width='800' style='color: #ff0000; padding: 20px;')
    | Zeus uses the REST API to communicate with your node.
    | You have this API disabled in your node settings.
    | Please enable it to connect with Zeus.
  p
    | • Open the Zeus app and go to the Settings. Select 'Add a new node'. <br />
    | • You can connect by either scanning the QR code, copy/pasting the LNDConnect details, or copy/pasting the Endpoint and Macaroon individually.  <br />
    | • After your connection information is entered, select 'Save Node Config'. <br />
  p
    | LNDConnect
  copy-pill(:text='connectURI' color='accent' text-color='warning').text-break
  p.font-weight-light
    | click to copy
  br
  qrcode-vue(v-model='connectURI' size='300')
  p
  | API Endpoint
  p
  copy-pill(:text='api' color='accent' text-color='warning').text-break
  p.font-weight-light
    | click to copy
  p
  | Port
  p
  copy-pill(text='8080' color='accent' text-color='warning').text-break
  p.font-weight-light
    | click to copy
  p
  | Macaroon Hex:
  p
  copy-pill(:text='macHex' color='accent' text-color='warning').text-break
  p.font-weight-light
    | click to copy
  p
  a(href="https://github.com/ZeusLN/zeus" target="_blank") Zeus Documentation.
</template>
<script lang="ts">
import { defineComponent, ref, computed, watch } from '@vue/composition-api'
import { Node } from '~/types/apiResponse'
import useNodeApi from '~/compositions/useNodeApi'

export default defineComponent({
  components: {
    CopyPill: () => import('~/components/core/CopyPill.vue'),
    QrcodeVue: () => import('qrcode.vue')
  },
  props: {
    connectURI: {
      type: String,
      required: true
    },
    api: {
      type: String,
      required: true
    },
    macaroon: {
      type: String,
      required: true
    },
    rest: {
      type: Boolean,
      required: true
    }
  },
  setup (props, { emit }) {
    function clear () {
      emit('clear')
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

    const macHex = computed(() => base64ToHex(props.macaroon))
    return {
      clear,
      macHex
    }
  }
})
</script>
