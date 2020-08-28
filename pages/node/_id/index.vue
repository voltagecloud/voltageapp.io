<template lang="pug">
v-container
  v-row
    v-col
      v-fade-transition
        node-controls(:nodeID='nodeID' @event='$fetch')
          template(v-slot:append-content v-if='nodeData && nodeData.node_name')
            v-divider
            data-table(:node='nodeData')
            v-divider
            v-container(v-if='canInit')
              v-btn(color='highlight' block @click='initialize' :loading='initializing').info--text Initialize
            v-container.align-center.justify-center(v-if='canUnlock')
              v-dialog(max-width='800' v-model='unlockDialog')
                template(v-slot:activator='{ on }')
                  v-btn(v-on='on' color='highlight' block).info--text Unlock
                v-card.text-center(style='padding: 20px;')
                  v-card-text.display-1 Enter your node's password
                  v-card-actions
                    v-form(style='width: 100%' ref='form' v-model='valid' @submit.prevent='unlockNode')
                      v-text-field(v-model='nodePassword' type='password' :rules='[char8]' :error-messages='error')
                      v-btn(type='submit' :disabled='!valid' color='highlight' :loading='unlocking' block).info--text Unlock Node
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
import { defineComponent, computed, ref, watch } from '@vue/composition-api'
import axios from 'axios'
import { nodeStore, lndStore } from '~/store'
import useNodeStatus from '~/compositions/useNodeStatus'
import useNodeApi from '~/compositions/useNodeApi'
import useFormValidation from '~/compositions/useFormValidation'
import { Node } from '~/types/apiResponse'

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
    if (!this.timer) {
      // make sure interval is clean
      // set new interval
      // @ts-ignore
      this.timer = setInterval(async () => {
        // @ts-ignore
        let previousStatus = this.status
        // If the node was running or stopped on load don't try to refresh
        if (previousStatus === 'running' || previousStatus === 'stopped') {
          clearInterval(timerID)
          return
        }
        // @ts-ignore
        const { postNode } = useNodeApi(this.$nuxt.context)
        // @ts-ignore
        const res = await postNode(this.nodeID)
        // @ts-ignore
        const shouldRefresh = previousStatus === res.status
        // @ts-ignore
        previousStatus = res.status
        // If the user leaves the node's page stop checking
        // @ts-ignore
        if (this.$route.params.id !== res.node_id) {
          // @ts-ignore
          clearInterval(this.timer)
          return
        }
        if (!shouldRefresh) {
          // If the node is in a running or stopped state we want to stop checking
          if (previousStatus === 'running' || previousStatus === 'stopped') {
            // @ts-ignore
            clearInterval(this.timer)
          }
        }
      }, 5000)
    }
  },
  setup (_, { root }) {
    const nodeID = ref(root.$nuxt.context.params.id)
    const nodeData = computed(() => nodeStore.nodes.filter(elem => elem.node_id === nodeID.value)[0])
    const { canInit, canUnlock, canUpdate, status } = useNodeStatus(nodeData)
    const { updateNode, updateStatus, postNode } = useNodeApi(root.$nuxt.context)

    const timer = ref<NodeJS.Timeout|null>(null)

    const initializing = ref(false)
    async function initialize () {
      console.log(nodeData.value.node_id)
      lndStore.CURRENT_NODE(nodeData.value)
      initializing.value = true
      const node = lndStore.currentNode as Node
      console.log(node)
      const seed = await axios({
        url: 'https://' + node.api_endpoint + ':8080/v1/genseed',
        method: 'GET'
      })
      initializing.value = false
      lndStore.SEED(seed.data)
      root.$router.push('/confirm')
    }

    const { char8, valid, form, password: nodePassword } = useFormValidation()

    const unlockDialog = ref(false)
    const unlocking = ref(false)
    const error = ref('')
    async function unlockNode () {
      lndStore.CURRENT_NODE(nodeData.value)
      unlocking.value = true
      try {
        const node = lndStore.currentNode as Node
        await axios({
          url: 'https://' + node.api_endpoint + ':8080/v1/unlockwallet',
          method: 'POST',
          data: {
            wallet_password: btoa(nodePassword.value),
            stateless_init: true
          },
          timeout: 30000
        })
        await updateStatus(nodeData.value.node_id, 'unlocking')
        postNode(nodeID.value)
        unlockDialog.value = false
      } catch (err) {
        error.value = `${err}`
      } finally {
        unlocking.value = false
      }
    }

    // clear errors on typing in password field
    watch(nodePassword, () => { error.value = '' })

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
      initializing,
      unlocking,
      unlockNode,
      char8,
      valid,
      form,
      nodePassword,
      unlockDialog,
      timer,
      error
    }
  }
})
</script>
