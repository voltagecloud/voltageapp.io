<template lang="pug">
v-container
  v-row
    v-col
      v-fade-transition
        node-controls(:nodeID='nodeID')
          template(v-slot:append-content v-if='nodeData && nodeData.node_name')
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
  setup (_, {root}) {
    const nodeID = ref(root.$nuxt.context.params.id)
    const nodeData = computed(() => nodeStore.nodes.filter(elem => elem.node_id == nodeID.value)[0])

    return {
      nodeData,
      nodeID
    }
  }
})
</script>