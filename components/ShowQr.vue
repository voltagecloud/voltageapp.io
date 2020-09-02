<template lang="pug">
v-dialog(max-width='800' :value='connectURI' @click:outside='clear')
    v-card(:value='connectURI')
        qrcode-vue(v-model='connectURI' size='300' ).mb-3
        copy-pill(:text='connectURI' color='accent' text-color='warning').text-break
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
