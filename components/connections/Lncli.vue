<template lang="pug">

v-card.text-center.align-center(style='padding: 20px;')
  p.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
    | lncli
  p
    | To connect using lncli, you must download your macaroon and TLS certificate below. 
    | After you have downloaded the necessary files, simply point your CLI to their location.
  div.font-weight-light.text--darken-1.justify-center.align-center(v-if='apiErrorMessage' max-width='800' style='color: #ff0000; padding: 20px;')
    | lncli uses gRPC to communicate with your node.
    | You have this API disabled in your node settings.
    | Please enable it to connect with lncli.
  p
  | Command Line:
  p
  div(style='text-align: left; overflow: scroll; white-space: pre; background-color: #505050; font-family: monospace; color: #ffffff; border-radius: 5px; padding: 10px; max-width: 85%; margin: auto;')
    | $ lncli \
    |   --rpcserver={{ api }}:10009 \
    |   --macaroonpath=/path/to/admin.macaroon \
    |   --tlscertpath=/path/to/tls.cert \
    |   getinfo
  p
  | API Endpoint
  p
  copy-pill(:text='api + ":10009"' color='accent' text-color='warning').text-break
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

    const apiErrorMessage = ref((!props.grpc) ? true : false)

    return {
      apiErrorMessage
    }
  }
})
</script>