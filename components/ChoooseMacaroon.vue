<template lang="pug">
  v-card(color='secondary')
    v-progress-linear(v-if='loading' absolute top color='accent' indeterminate)
    v-card-title
      v-select(v-model.lazy='macaroon' :items='macaroonOpts' placeholder='Select Macaroon' outlined).mr-3
      v-radio-group(v-model='apiType').ml-3
        v-radio(label='GRPC' :value='ApiType.grpc')
        v-radio(label='REST' :value='ApiType.rest')
    v-card-text(v-if='connectPayload').text-center
      qrcode-vue(v-model='connectPayload.lndconnect_uri' size='300').mb-3
      copy-pill(:text='connectPayload.lndconnect_uri' color='accent' text-color='warning').text-break
</template>
<script lang="ts">
import { defineComponent, ref, reactive, computed, watch } from '@vue/composition-api'
import { MacaroonLevel, ApiType } from '~/types/api'
import useNodeControls from '~/compositions/useNodeControls'
import { nodeStore } from '~/store'
import { Connect } from '~/types/apiResponse'

export default defineComponent({
  components: {
    QrcodeVue: () => import('qrcode.vue'),
    CopyPill: () => import('~/components/core/CopyPill.vue')
  },
  props: {
    nodeID: {
      type: String,
      required: true
    }
  },
  setup (props, { root }) {
    const macaroonOpts = reactive(Object.values(MacaroonLevel))
    const macaroon = ref<MacaroonLevel|null>(null)

    const apiType = ref(ApiType.grpc)
    const nodeData = computed(() => nodeStore.nodes.filter(nodeObj => nodeObj.node_id === props.nodeID)[0])

    const { loading, connect } = useNodeControls(nodeData, root.$nuxt.context)

    const connectPayload = ref<Connect|null>(null)

    watch([macaroon, apiType], async () => {
      if (macaroon.value) {
        const res = await connect(macaroon.value, apiType.value)
        if (res && res.data) {
          connectPayload.value = res.data
        }
      }
    })

    return {
      macaroonOpts,
      macaroon,
      apiType,
      loading,
      connectPayload,
      ApiType
    }
  }
})
</script>
