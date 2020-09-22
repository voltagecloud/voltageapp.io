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
    :href='"data:application/text-plain;base64,"+cert'
    download='tls.cert'
    title='tls.cert'
  ).info--text
    | Download Certificate


</template>
<script lang="ts">
import { defineComponent, ref, computed, watch } from '@vue/composition-api'
import { Node } from '~/types/apiResponse'
import useNodeApi from '~/compositions/useNodeApi'

export default defineComponent({
  components: {
    CopyPill: () => import('~/components/core/CopyPill.vue'),
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
  setup (props, { emit }) {
    function clear () {
      emit('clear')
    }

    // @ts-ignore
    function base64ToHex(str) {
        const raw = atob(str);
        let result = '';
        for (let i = 0; i < raw.length; i++) {
            const hex = raw.charCodeAt(i).toString(16);
            result += (hex.length === 2 ? hex : '0' + hex);
        }
        return result.toUpperCase();
    }

    const macHex = computed(() => base64ToHex(props.macaroon))
    return {
        macHex
    }
  }
})
</script>