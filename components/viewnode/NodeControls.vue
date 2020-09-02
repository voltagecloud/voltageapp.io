<template lang="pug">
v-card(color='info')
  v-progress-linear(indeterminate absolute top v-if='loading' color='accent')
  template(v-if='nodeData && nodeData.node_name')
    v-card-title
      v-row(align='center' justify='space-between' no-gutters)
        v-col(@click='navigate' cols='7' style='cursor: pointer;')
          v-row(no-gutters)
            v-col(cols='16').font-weight-light.warning--text.text--darken-1.v-card__title
              span {{ nodeData.node_name }}
              span.caption.warning--text.ml-2 {{ nodeData.status }}
            v-col(cols='12').overline
              | {{ nodeData.purchased_type=='trial' ? 'Testnet (trial)' : nodeData.network }}
        v-col(cols='auto')
          v-row(justify='end')
            v-dialog(max-width='800')
              template(v-slot:activator='{ on }')
            v-btn(:disabled='!canStart' icon @click='() => { startNode(); $emit("event"); }').mx-1
              v-icon mdi-play
            v-btn(:disabled='!canStop' icon @click='() => { stopNode(); $emit("event"); }').mx-1
              v-icon mdi-stop
            v-btn(:disabled='!canDelete' icon @click='deleteModal = true').ml-1.mr-3
              v-icon mdi-delete
            v-dialog(v-model='deleteModal' max-width='800')
              v-card
                v-card-text.pt-3 Are you sure you wish to delete this node?
                v-card-actions
                  v-btn(color='info' @click='closeAndDelete') Yes
                  v-btn(@click='deleteModal = false') No

    slot(name='append-content')
</template>
<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import useNodeControls from '~/compositions/useNodeControls'
import useNodeStatus from '~/compositions/useNodeStatus'
import useNodeApi from '~/compositions/useNodeApi'
import { nodeStore } from '~/store'

export default defineComponent({
  props: {
    nodeID: {
      type: String,
      required: true
    }
  },
  async fetch () {
    console.log('fetching')
    // @ts-ignore
    console.log(this.nodeID)
    // @ts-ignore
    const ctx = this.$nuxt.context
    const { postNode } = useNodeApi(ctx)
    // @ts-ignore
    await postNode(this.nodeID)
  },
  components: {
    ChooseMacaroon: () => import('~/components/ChoooseMacaroon.vue')
  },
  setup (props, { root, emit }) {
    const nodeData = computed(() => nodeStore.nodes.filter(nodeObj => nodeObj.node_id === props.nodeID)[0])

    function navigate () {
      if (root.$route.name !== 'node-id') {
        root.$router.push(`/node/${nodeData.value.node_id}`)
      }
    }

    const deleteModal = ref(false)

    const { canStart, canStop, canDelete, canConnect } = useNodeStatus(nodeData)

    const { deleteNode, startNode, stopNode, connect, loading } = useNodeControls(nodeData, root.$nuxt.context)

    async function closeAndDelete () {
      deleteModal.value = false
      await deleteNode()
    }

    return {
      canStart,
      canStop,
      canDelete,
      canConnect,
      nodeData,
      navigate,
      deleteModal,
      closeAndDelete,
      startNode,
      stopNode,
      connect,
      loading
    }
  }
})
</script>
