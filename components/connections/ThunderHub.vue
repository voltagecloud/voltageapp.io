<template lang="pug">

v-card.text-center.align-center(style='padding: 20px;')
  p.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
    | ThunderHub
  div.font-weight-light.text--darken-1.justify-center.align-center(v-if='!grpc' max-width='800' style='color: #ff0000; padding: 20px;')
    | ThunderHub uses gRPC to communicate with your node.
    | You have this API disabled in your node settings.
    | Please enable it to connect with ThunderHub.
  p
    | To connect with ThunderHub, copy and paste the follow contents into your Account Config file.
  p
  | Account Config File:
  p
  div(style='text-align: left; overflow: scroll; white-space: pre; background-color: #505050; font-family: monospace; color: #ffffff; border-radius: 5px; padding: 10px; max-width: 85%; margin: auto;')
    | accounts:
    |   - name: '{{ nodename }}'
    |     serverUrl: '{{ api }}:10009'
    |     macaroon: '{{ macaroon }}'
    | 
  p
  a(href="https://github.com/apotdevin/thunderhub#server-accounts" target="_blank") ThunderHub Documentation.
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

    const nodename = computed(() => props.api.split('.')[0])

    return {
        nodename
    }
  }
})
</script>