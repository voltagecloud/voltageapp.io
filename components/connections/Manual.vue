<template lang="pug">

v-card.text-center.align-center(style='padding: 20px;')
  p.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
    | Manual
  p
    | Need to connect to an app not listed here?
    | Get everything you need to connect below.
  p
  | API Endpoint
  p
  copy-pill(:text='api' color='accent' text-color='warning').text-break
  p.font-weight-light
    | click to copy
  p
  | Macaroon
  p
  v-btn(
    color='warning'
    text-color='highlight'
    :href='"data:application/text-plain;base64,"+macaroon'
    download='admin.macaroon'
    title='admin.macaroon'
  ).info--text
    | Download Macaroon
  p
  p
    | Macaroon Hex:
    copy-pill(:text='macHex' color='accent' text-color='warning').text-break
    p.font-weight-light
      | click to copy
  p
  | TLS Certificate
  p
  v-btn(
    color='warning'
    :href='"data:application/text-plain;base64,"+fullCert'
    download='tls.cert'
    title='tls.cert'
  ).info--text
    | {{ certButtonText }}

</template>
<script lang="ts">
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
    cert: {
      type: String,
      required: true
    },
    macaroon: {
      type: String,
      required: true
    }
  },
  setup (props, { root, emit }) {
    const { getCert } = useNodeApi(root.$nuxt.context)

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

    const fullCert = ref('')
    const certReady = ref(false)
    const certButtonText = ref('Download Certificate')
    const error = ref('')

    async function downloadCert () {
      try {
        const res = await getCert(root.$nuxt.$route.params.id)
        const { tls_cert } = res
        fullCert.value = tls_cert
        if (fullCert.value == 'pending') {
          certButtonText.value = 'Certificate is pending'
        }
        certReady.value = true
      } catch (e) {
        error.value = e.toString()
      }
    }
    downloadCert()

    const macHex = computed(() => base64ToHex(props.macaroon))
    return {
      macHex,
      error,
      fullCert,
      certButtonText,
      certReady
    }
  }
})
</script>
