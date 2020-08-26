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
              v-btn(color='highlight' block @click='initialize' :loading='initializing').info--text Initialize
            v-container(v-if='canUnlock')
              v-btn(color='highlight' block).info--text Unlock
            v-container(v-if='canUpdate' @click='update')
              v-btn(color='highlight' block).info--text Update Available
            edit-settings(:node='nodeData')
            v-container
              v-dialog(max-width='800')
                template(v-slot:activator='{ on }')
                  v-btn(v-on='on' color='secondary' block).warning--text Export Data
                export-data(:nodeID='nodeID' :nodeStatus='status')
</template>
<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import axios from 'axios'
import { nodeStore, lndStore } from '~/store'
import useNodeStatus from '~/compositions/useNodeStatus'
import useNodeApi from '~/compositions/useNodeApi'

let timerID: NodeJS.Timeout

export default defineComponent({
  components: {
    NodeControls: () => import('~/components/viewnode/NodeControls.vue'),
    DataTable: () => import('~/components/viewnode/DataTable.vue'),
    EditSettings: () => import('~/components/viewnode/EditSettings.vue'),
    ExportData: () => import('~/components/ExportData.vue')
  },
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  fetch () {
    // Logic for auto-refreshing
    // @ts-ignore
    if (!timerID) {
      // make sure interval is clean
      // set new interval
      const timerID = setInterval(async () => {
        // @ts-ignore
        let previousStatus = this.status
        // If the node was running or stopped on load don't try to refresh
        if (previousStatus === 'running' || previousStatus === 'stopped') {
          clearInterval(timerID)
          return
        }
        // @ts-ignore
        const res = await this.$nuxt.context.$axios.post('/node', {
          // @ts-ignore
          node_id: this.nodeID
        })
        // @ts-ignore
        const shouldRefresh = previousStatus === res.data.status
        // @ts-ignore
        previousStatus = res.data.status

        // If the user leaves the node's page stop checking
        // @ts-ignore
        if (this.$route.params.id !== res.data.node_id) {
          clearInterval(timerID)
          return
        }
        if (!shouldRefresh) {
          // @ts-ignore
          this.$router.go()
          // If the node is in a running or stopped state we want to stop checking
          if (previousStatus === 'running' || previousStatus === 'stopped') {
            clearInterval(timerID)
          }
        }
      }, 5000)
    }
  },
  setup (_, { root }) {
    const nodeID = ref(root.$nuxt.context.params.id)
    const nodeData = computed(() => nodeStore.nodes.filter(elem => elem.node_id === nodeID.value)[0])
    const { canInit, canUnlock, canUpdate, status } = useNodeStatus(nodeData)
    const { updateNode } = useNodeApi(root.$nuxt.context)

    const initializing = ref(false)
    async function initialize () {
      console.log('requesting')
      lndStore.CURRENT_NODE(nodeData.value.api_endpoint)
      initializing.value = true
      const seed = await axios({
        url: lndStore.currentNode + '/v1/genseed',
        method: 'GET'
      })
      console.log({ seed })
      initializing.value = false
      lndStore.SEED(seed.data)
      root.$router.push('/confirm')
    }

    async function update () {
      await updateNode(nodeData.value.node_id)
      // @ts-ignore
      root.$nuxt.$router.go()
    }

    return {
      nodeData,
      nodeID,
      status,
      canInit,
      canUnlock,
      canUpdate,
      initialize,
      update,
      initializing
    }
  }
})
</script>
