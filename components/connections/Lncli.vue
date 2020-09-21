<template lang="pug">

v-card.text-center.align-center(style='padding: 20px;')
  p.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
    | lncli
  div.font-weight-light.text--darken-1.justify-center.align-center(v-if='apiErrorMessage' max-width='800' style='padding: 20px;')
    | lncli uses gRPC to communicate with your node.
    | You have this API disabled in your node settings.
    | Please enable it to connect with lncli.
  p
  | Command Line:
  p
  v-chip(:dark='true' :label='true' :large='true' style='font-family: monospace;')
    | {{ generatedCommand }}
  p
  | API Endpoint
  p
  copy-pill(:text='api + ":10009"' color='accent' text-color='warning').text-break
  p
  | Macaroon
  p
  v-chip(color='accent' text-color='warning')
    | Download
  p
  | TLS Certificate
  p
  v-chip(color='accent' text-color='warning')
    | Download


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

    const generatedCommand = computed(() => `lncli --rpcserver=${props.api}:10009 --macaroonpath=/path/to/admin.macaroon --tlscertpath=/path/to/tls.cert getinfo`)

    return {
      apiErrorMessage,
      generatedCommand
    }
  }
})
</script>