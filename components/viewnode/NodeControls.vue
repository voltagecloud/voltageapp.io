<template lang="pug">
v-card(color='info')
  v-card-title.font-weight-light.warning--text.text--darken-1
    | {{ node.node_name }}
    v-progress-circular(v-if='loading' indeterminate size='20' width='2').ml-3
    v-row(justify='end')
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
import { Node } from '~/types/apiResponse'


export default defineComponent({
  props: {
    node: {
      type: Object as () => Node,
      required: true
    }
  },
  setup (props, {root}) {
    const nodeData = computed(() => props.node)
    return useNodeControls(nodeData, root.$nuxt.context)
  }
})
</script>