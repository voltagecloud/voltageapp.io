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
            v-container(v-if='canInit')
              v-btn(color='secondary' block).warning--text Initialize
            v-container(v-if='canUnlock')
              v-btn(color='secondary' block).warning--text Unlock
            edit-settings(:node='nodeData')
            v-container
              v-dialog(max-width='800')
                template(v-slot:activator='{ on }')
                  v-btn(v-on='on' color='secondary' block).warning--text Export Data
                export-data(:nodeID='nodeID' :nodeStatus='nodeStatus')
</template>
<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import useNodeApi from '~/compositions/useNodeApi'
import { nodeStore } from '~/store'
import useNodeStatus from '~/compositions/useNodeStatus'

export default defineComponent({
  components: {
    NodeControls: () => import('~/components/viewnode/NodeControls.vue'),
    DataTable: () => import('~/components/viewnode/DataTable.vue'),
    EditSettings: () => import('~/components/viewnode/EditSettings.vue'),
    ExportData: () => import('~/components/ExportData.vue')
  },
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  setup (_, {root}) {
    const nodeID = ref(root.$nuxt.context.params.id)
    const nodeData = computed(() => nodeStore.nodes.filter(elem => elem.node_id == nodeID.value)[0])
    const nodeStatus = ref(nodeData.value.status)
    const { canInit, canUnlock } = useNodeStatus(nodeData)

    return {
      nodeData,
      nodeID,
      nodeStatus,
      canInit,
      canUnlock
    }
  }
})
</script>