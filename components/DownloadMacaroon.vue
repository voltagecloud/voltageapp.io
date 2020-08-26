<template lang="pug">
  v-container
    v-row
      v-col Download your macaroon
      v-col
        v-btn(@click='downloadMacaroon')
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { lndStore } from '~/store'

export default defineComponent({
  setup (_, context) {
    function downloadMacaroon () {
      const base64str = lndStore.macaroon
      // convert hex to byte array
      const binary = atob(base64str.replace(/\s/g, ''))
      const len = binary.length
      const buffer = new ArrayBuffer(len)
      const view = new Uint8Array(buffer)
      for (let i = 0; i < len; i++) {
        view[i] = binary.charCodeAt(i)
      }
      const blob = new Blob([view], { type: 'application/octet-stream' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'output.macaroon'
      link.click()
      context.emit('done')
    }

    return {
      downloadMacaroon
    }
  }
})
</script>
