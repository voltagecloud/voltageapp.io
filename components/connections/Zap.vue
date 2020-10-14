<template lang="pug">

v-card.text-center.align-center(style='padding: 20px;')
  p.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
    a(href="https://zaphq.io" target="_blank")
      | Zap
  div.font-weight-light.text--darken-1.justify-center.align-center(v-if='!grpc' max-width='800' style='color: #ff0000; padding: 20px;')
    | Zap uses gRPC to communicate with your node.
    | You have this API disabled in your node settings.
    | Please enable it to connect with Zap.
  p
    | • Open the Zap app and create a new wallet. Select 'Connect'. <br />
    | • You can connect by either scanning the QR code below or copy/pasting the LNDConnect string into the 'Connection String' box.<br />
  p
    | Connection String
  copy-pill(:text='connectURI' color='accent' text-color='warning').text-break
  p.font-weight-light
    | click to copy
  br
  qrcode-vue(v-model='connectURI' size='300')
  p
  a(href="https://docs.zaphq.io/docs-desktop-lnd-connect" target="_blank") Zap Documentation.
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
    grpc: {
      type: Boolean,
      required: true
    }
  },
  setup (props, { emit }) {
    function clear () {
      emit('clear')
    }

    return {
      clear
    }
  }
})
</script>
