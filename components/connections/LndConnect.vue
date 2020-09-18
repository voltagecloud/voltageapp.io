<template lang="pug">

v-card.text-center.align-center(style='padding: 20px;')
  p.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
    | LNDConnect
  v-chip(v-if='apiErrorMessage' color='warning')
    | Both APIs are off. To connect, please enable at least one API in your settings.
  p
  copy-pill(v-if='!apiErrorMessage' :text='connectURI' color='accent' text-color='warning').text-break
  p.font-weight-light
    | click to copy
  br
  qrcode-vue(v-if='!apiErrorMessage' v-model='connectURI' size='300')
  div.font-weight-light.text--darken-1.justify-center.align-center(v-if='!showQr && !apiErrorMessage' max-width='800' style='padding: 20px;')
    | Voltage uses TLS Certificates that are signed by a trusted Certificate Authority.
    | You should only include the certificate if your application explicitly requires it.
  v-container
      v-row(align='center' justify='space-between')
        v-col(cols='1' style='padding-left: 10%;')
          v-radio-group(v-model='apiDefault')
            v-radio(:label='grpcMessage' :disabled='grpcMessage !== "GRPC"' value='grpc' key='grpc').no-select
            v-radio(:label='restMessage' :disabled='restMessage !== "REST"' value='rest' key='rest')
        v-spacer
        v-col(cols='6')
          v-checkbox(label="Include TLS Certificate" :messages='certMessage' :disabled='certMessage !== ""' v-model='certDefault')
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
    cert: {
      type: String,
      required: true
    },
    macaroon: {
      type: String,
      required: true
    },
    keyId: {
        type: String,
        required: true
    },
    grpc: {
        type: Boolean,
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

    const apiErrorMessage = ref((!props.grpc && !props.rest) ? true : false)
    const apiDefault = ref((props.grpc) ? 'grpc' : 'rest')
    const certDefault = ref(false)
    const certMessage = ref((props.cert === "pending") ? "Certificate is pending" : "")
    const grpcMessage = ref((props.grpc) ? "GRPC" : "GRPC is disabled")
    const restMessage = ref((props.rest) ? "REST" : "REST is disabled")
    const dynamicPort = ref((props.grpc) ? '10009' : '8080')
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
      showQr,
      apiErrorMessage,
      certMessage,
      grpcMessage,
      restMessage
    }
  }
})
</script>