<template lang="pug">
v-card(color='info')
  v-progress-linear(indeterminate absolute top v-if='loading' color='accent')
  template(v-if='nodeData && nodeData.node_name')
    v-card-title
      v-row(align='center' justify='space-between' no-gutters)
        v-col(@click='navigate' cols='4')
          v-row(no-gutters)
            v-col(cols='12').font-weight-light.warning--text.text--darken-1.v-card__title
              | {{ nodeData.node_name }}
            v-col(cols='12').overline
              | {{ nodeData.purchased_type=='trial' ? 'Testnet (trial)' : nodeData.network }}
        v-col(cols='auto')
          v-row(justify='end')
            v-btn(icon ).mx-1
              v-icon mdi-qrcode-scan
            v-btn(:disabled='!canStart' icon @click='startNode').mx-1
              v-icon mdi-play
            v-btn(:disabled='!canStop' icon @click='stopNode').mx-1
              v-icon mdi-stop
            v-btn(:disabled='!canDelete' icon @click='deleteNode').ml-1.mr-3
              v-icon mdi-delete
    slot(name='append-content')
</template>
<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import useNodeControls from '~/compositions/useNodeControls'
import useNodeApi from '~/compositions/useNodeApi'
import { Node } from '~/types/apiResponse'
import { nodeStore } from '../../store'


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
  setup (props, {root}) {
    const nodeData = computed(() => nodeStore.nodes.filter(nodeObj => nodeObj.node_id == props.nodeID)[0])

    function navigate () {
      if (root.$route.name !== 'node-id') {
        root.$router.push(`/node/${nodeData.value.node_id}`)
      }
    }
    
    return {
      ...useNodeControls(nodeData, root.$nuxt.context),
      nodeData,
      navigate
    }
  }
})
</script>