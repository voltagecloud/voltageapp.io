<template lang="pug">
v-card(color='info')
  v-card-title.font-weight-light.warning--text.text--darken-1
    | {{ nodeRef.node_name }}
    v-progress-circular(v-if='loading' indeterminate size='20' width='2').ml-3
    v-row(justify='end')
      v-btn(:disabled='canStart' icon).mx-1
        v-icon mdi-play
      v-btn(:disabled='canStop' icon).mx-1
        v-icon mdi-stop
      v-btn(:disabled='canDelete' icon).ml-1.mr-3
        v-icon mdi-delete
  slot(name='append-content')
</template>
<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import useNodeControls from '~/compositions/useNodeControls'
import { Node } from '~/types/apiResponse'


export default defineComponent({
  props: {
    node: {
      type: Object as () => Node,
      required: true
    }
  },
  setup ({node}, {root}) {
    const nodeRef = computed(() => node)
    return {
      ...useNodeControls(nodeRef, root.$nuxt.context),
      nodeRef
    }
  }
})
</script>