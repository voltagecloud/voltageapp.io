<template lang="pug">
v-dialog(max-width='800' :value='connectURI' @click:outside='clear')
  v-card.text-center.align-center(style='padding: 20px;')
    v-container
      p.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
        | LNDConnect
      copy-pill(:text='connectURI' color='accent' text-color='warning' @click.prevent='').text-break
      p.font-weight-light
        | click to copy
      br
      qrcode-vue(v-if='showQr' v-model='connectURI' size='300')
      p(v-if='!showQr').font-weight-light.text--darken-1.v-card__title.justify-center.align-center
        | Can't generate QR code
      div(v-if='!showQr' max-width='800' style='padding: 20px;')
        | Voltage uses TLS Certificates that are signed by a trusted Certificate Authority. These Certificates
        | are much larger than a self-signed certificate. Therefore, they are too big to fit into a QR code.
        p
        | If your application still requires a TLS Certificate, you can either download your certificate from your 
        | node's dashboard or copy and paste the lndconnect URI above.
      v-container
        v-row(align='center' justify='space-between')
          v-col(cols='1' style='padding-left: 10%;')
            v-radio-group(v-model='apiDefault')
              v-radio(label='GRPC' value='grpc' key='grpc')
              v-radio(label='REST' value='rest' key='rest')
          v-spacer
          v-col(cols='6')
            v-checkbox(@change='changeApi' label="Include TLS Certificate" v-model='certDefault')
      p These codes contain sensitive data used to connect to your node. Guard them carefully.
</template>
<script lang="ts">
import { defineComponent, ref, computed, watch } from '@vue/composition-api'

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
    cert: {
      type: String,
      required: true
    },
    macaroon: {
      type: String,
      required: true
    }
  },
  setup (props, { emit }) {
    function clear () {
      emit('clear')
    }

    const apiDefault = ref('grpc')
    const certDefault = ref(false)
    const dynamicPort = ref('10009')
    const dynamicCert = ref('')

    // @ts-ignore
    function changeApi (event) {
      if (event === 'rest') {
        dynamicPort.value = '8080'
      } else if (event === 'grpc') {
        dynamicPort.value = '10009'
      } else if (event === true) {
        dynamicCert.value = props.cert
      } else if (event === false) {
        dynamicCert.value = ''
      }
      emit('changeApi', props.api, dynamicPort.value, dynamicCert.value, props.macaroon)
    }
    watch(apiDefault, changeApi)

    const showQr = computed(() => !dynamicCert.value)

    return {
      apiDefault,
      certDefault,
      clear,
      changeApi,
      dynamicCert,
      dynamicPort,
      showQr
    }
  }
})
</script>
