<template lang="pug">
v-dialog(max-width='800' :value='connectURI' @click:outside='clear')
  v-tabs(:centered='true' :grow='true' show-arrows)
    v-tab(key="1")
      | Zap
    v-tab-item(key="1")
      zap(:connectURI='connectURI' :grpc='grpc' keyId="1")
    v-tab(key="2")
      | Zues
    v-tab-item(key="2")
      v-card.text-center.align-center(style='padding: 20px;')
        p.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
          | Zues
    v-tab(key="3")
      | LNCLI
    v-tab-item(key="3")
      lncli(:api='api' :cert='cert' :macaroon='macaroon' :grpc='grpc' keyId="3")
    v-tab(key="4")
      | Thunderhub
    v-tab-item(key="4")
      v-card.text-center.align-center(style='padding: 20px;')
        p.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
          | Thunderhub
    v-tab(key="5")
      | Joule
    v-tab-item(key="5")
      v-card.text-center.align-center(style='padding: 20px;')
        p.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
          | Joule
    v-tab(key="6")
      | LNDConnect
    v-tab-item(key='6')
      lnd-connect(:connectURI='connectURI' :api='api' :cert='cert' :macaroon='macaroon' :grpc='grpc' :rest='rest' @changeApi='updateApi' keyId="1")
    v-tab(key="7")
      | Manual
    v-tab-item(key="7")
      v-card.text-center.align-center(style='padding: 20px;')
        p.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
          | Manual

  v-card.text-center.align-center(style='padding: 20px;')
    p.font-weight-light.text--darken-1.justify-center.align-center
      | These codes contain sensitive data used to connect to your node. Guard them carefully.
    p
    p.font-weight-light.text--darken-1.justify-center.align-center
      | Helpful FAQ Links
    a(href="https://getvoltage.io/faq.html#collapseFive" target="_blank") How to connect to your node.
    p
    a(href="https://getvoltage.io/faq.html#collapseFour" target="_blank") Popular apps to connect to your node.

</template>
<script lang="ts">
import { defineComponent, ref, computed, watch } from '@vue/composition-api'

export default defineComponent({
  components: {
     // @ts-ignore
     LndConnect: () => import('~/components/connections/LndConnect.vue'),
     // @ts-ignore
     Lncli: () => import('~/components/connections/Lncli.vue'),
     // @ts-ignore
     Zap: () => import('~/components/connections/Zap.vue')
   },
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
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

      // @ts-ignore
      function updateApi (api, port, cert, mac) {
        emit('updateApi', api, port, cert, mac)
      }

      return {
        clear,
        updateApi
      }
  }
})
</script>