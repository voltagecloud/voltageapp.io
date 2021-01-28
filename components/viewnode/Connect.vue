<template lang="pug">
  div
    span(v-if='node.status !== "running"')
      | You can only connect to a running node. Please turn this node on before connecting
    node-password-input(
      v-else-if='!isMacaroonDecrypted'
      @done='handleConnectNode({password: $event, api: "rest"})'
      text='Connect'
      :error='error'
    )
    show-qr(
      v-else-if='isMacaroonDecrypted'
      :connectURI='connectURI'
      :api='apiEndpoint'
      :cert='cert'
      :macaroon='macaroon'
      :pass='pass'
      :grpc='grpc'
      :rest='rest'
      @updateApi='buildUri'
    )
</template>
<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { Node } from '~/types/apiResponse'
import useDecryptMacaroon from '~/compositions/useDecryptMacaroon'

export default defineComponent({
  components: {
    NodePasswordInput: () => import('~/components/NodePasswordInput.vue'),
    ShowQr: () => import('~/components/ShowQr.vue')
  },
  props: {
    node: {
      type: Object as () => Node,
      required: true
    }
  },
  setup (props, ctx) {
    const grpc = computed(() => props.node.settings.grpc)
    const rest = computed(() => props.node.settings.rest)

    return {
      ...useDecryptMacaroon(ctx, props.node.node_id),
      grpc,
      rest
    }
  }
})
</script>
