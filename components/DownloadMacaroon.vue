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
      const link = document.createElement('a')
      link.href = `data:application/octet-stream;base64,${lndStore.macaroon}`
      link.download = 'admin.macaroon'
      link.click()
      context.emit('done')
    }

    return {
      downloadMacaroon
    }
  }
})
</script>
