<template lang="pug">
v-dialog(max-width='800' :value='connectURI' @click:outside='clear')
  v-card.text-center.align-center(style='padding: 20px;')
    p.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
      | LNDConnect
    copy-pill(:text='connectURI' color='accent' text-color='warning').text-break
    p.font-weight-light
      | click to copy
    br
    qrcode-vue(v-model='connectURI' size='300')
    div.font-weight-light.text--darken-1.justify-center.align-center(v-if='!showQr' max-width='800' style='padding: 20px;')
      | Voltage uses TLS Certificates that are signed by a trusted Certificate Authority.
      | You should only include the certificate if your application explicitly requires it.
    v-container
      v-row(align='center' justify='space-between')
        v-col(cols='1' style='padding-left: 10%;')
          v-radio-group(v-model='apiDefault')
            v-radio(label='GRPC' value='grpc' key='grpc').no-select
            v-radio(label='REST' value='rest' key='rest')
        v-spacer
        v-col(cols='6')
          v-checkbox(label="Include TLS Certificate" v-model='certDefault')
    p.font-weight-light.text--darken-1.justify-center.align-center
      | These codes contain sensitive data used to connect to your node. Guard them carefully.
    p
    p.font-weight-light.text--darken-1.justify-center.align-center
      | Helpful FAQ Links
    a(href="https://getvoltage.io/faq.html#collapseFive" target="_blank") How to connect to your node.
    p
    a(href="https://getvoltage.io/faq.html#collapseFour" target="_blank") Popular apps to connect to your node.

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
    watch(certDefault, changeApi)

    const showQr = computed(() => !dynamicCert.value)

    return {
      apiDefault,
      certDefault,
      clear,
      dynamicCert,
      dynamicPort,
      showQr
    }
  }
})
</script>