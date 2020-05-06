<template lang="pug">
  v-fade-transition
    v-card(color='info' v-if='node')
      v-card-title.font-weight-light.warning--text.text--darken-1
        | {{ node.node_name }}
        v-row(justify='end')
          v-btn(:disabled='canStart' icon).mx-1
            v-icon mdi-play
          v-btn(:disabled='canStop' icon).mx-1
            v-icon mdi-stop
          v-btn(:disabled='canDelete' icon).ml-1.mr-3
            v-icon mdi-delete
      v-simple-table
        tbody
          template(v-for='(elem, i) in nodeInfo')
            tr(v-if='!!elem.data' :key='i')
              td {{ elem.dataName }}
              td.text-center
                copy-pill(
                  color='accent'
                  text-color='warning'
                  :text='elem.data'
                )
          
</template>
<script lang="ts">
import { defineComponent, computed, ref, watchEffect } from '@vue/composition-api'
import useNodeApi from '../compositions/useNodeApi'
import useNodeControls from '~/compositions/useNodeControls'
import { Context } from '@nuxt/types'
import { layoutStore, nodeStore } from '../store'
import { Settings, NodeStatus } from '../types/api'

export default defineComponent({
  async fetch () {
    // @ts-ignore
    const ctx = this.$nuxt.context
    console.log('fetching')
    const { postNode } = useNodeApi(ctx)
    const nodeData = await postNode(ctx.params.id)
  },
  components: {
    CopyPill: () => import('~/components/core/CopyPill.vue')
  },
  setup (_, {root}) {

    const nodeID = ref(root.$nuxt.context.params.id)
    const node = computed(() => nodeStore.nodes.filter(elem => elem.node_id == nodeID.value)[0])

    const nodeInfo = computed(() => ([
      { dataName: 'Status', data: node.value?.status },
      { dataName: 'Public Key', data: node.value?.public_key },
      { dataName: 'Onion Address', data: node.value?.onion_address },
      { dataName: 'Creation Date', data: node.value?.creation_date },
      { dataName: 'Expiry Date', data: node.value?.expires },
      { dataName: 'API Endpoint', data: node.value?.api_endpoint }
    ]))

    const showSettings = ref(false)
    const settings = computed(() => Object.assign({}, node.value?.settings || {}))

    const { deleteNode, updateSettings, loading } = useNodeApi(root.$nuxt.context)
    const { canStart, canStop, canDelete} = useNodeControls(node)

    return {
      nodeID,
      node,
      nodeInfo,
      showSettings,
      settings,
      deleteNode,
      updateSettings,
      loading,
      canStart,
      canStop,
      canDelete
    }
  }
})
</script>