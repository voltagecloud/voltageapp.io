<template lang="pug">
v-dialog(max-width='800' :value='connectURI' @click:outside='clear')
    v-card.text-center.align-center(style='padding: 20px;')
      qrcode-vue(v-model='connectURI' size='300' ).mb-3
      div(style='width: 100px').text-center
        v-radio-group(@change='changeApi' v-model='apiDefault')
          v-radio(label='GRPC' value='grpc')
          v-radio(label='REST' value='rest')
      copy-pill(:text='connectURI' color='accent' text-color='warning').text-break
      p.ml-3
      | These codes contain sensitive data used to connect to your node. Guard them carefully.
</template>
<script lang="ts">
import { defineComponent, watch, ref } from '@vue/composition-api'

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

    // @ts-ignore
    function changeApi (event) {
      if (event === 'rest') {
        var port = '8080'
      } else {
        var port = '10009'
      }
      emit('changeApi', props.api, port, '', props.macaroon)
    }

    return {
      apiDefault,
      clear,
      changeApi
    }
  }
})
</script>
