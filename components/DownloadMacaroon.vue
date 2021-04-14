<template lang="pug">
v-card.text-center.align-center(style='padding: 20px;')
  v-icon mdi-check-bold
  p.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
    | Your node is ready to go!
  p
  p.font-weight-light
    | First things first, you must download your macaroon. This is used to authenticate to your node.
  p
  v-btn(@click='downloadMacaroon' color='highlight' block max-width='200').info--text Download Macaroon
  p
  p.font-weight-light(style='padding: 20px;')
    | Now that you have a macaroon, you're ready to connect. You can connect with lndconnect or manually.
    | To use lndconnect, go to your node in the dashboard and select 'Connect'. You can either scan the QR code or copy
    | and paste the lndconnect URI.
  p
  v-btn(@click='done' color='highlight' block).info--text Go to my node
  p
  p.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
    | Helpful FAQ Links
  a(href="https://voltage.cloud/faq.html#connect" target="_blank") How to connect to your node.
  p
  a(href="https://voltage.cloud/faq.html#applications" target="_blank") Popular apps to connect to your node.
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
    }

    function done () {
      context.emit('done')
    }

    return {
      downloadMacaroon,
      done
    }
  }
})
</script>
