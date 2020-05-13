<template lang="pug">
v-container
  v-row
    v-col
      v-fade-transition
        node-controls(v-if='nodeData && nodeData.node_name' :node='nodeData')
          template(v-slot:append-content)
            v-divider
            data-table(:node='nodeData')
            v-divider
            edit-settings(:node='nodeData')
</template>
<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import useNodeApi from '~/compositions/useNodeApi'
import { nodeStore } from '~/store'

export default defineComponent({
  components: {
    NodeControls: () => import('~/components/viewnode/NodeControls.vue'),
    DataTable: () => import('~/components/viewnode/DataTable.vue'),
    EditSettings: () => import('~/components/viewnode/EditSettings.vue')
  },
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  async fetch () {
    // @ts-ignore
    const ctx = this.$nuxt.context
    const { postNode } = useNodeApi(ctx)
    await postNode(ctx.params.id)
  },
  setup (_, {root}) {
    const nodeID = ref(root.$nuxt.context.params.id)
    const nodeData = computed(() => nodeStore.nodes.filter(elem => elem.node_id == nodeID.value)[0])

    return {
      nodeData
    }
  }
})
</script>