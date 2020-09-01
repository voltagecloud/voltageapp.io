<template lang="pug">
  v-container
    v-row(justify='center' align='center' no-gutters)
      v-col(cols='12' lg='10' xl='8' v-if='!noNodes')
        v-fade-transition(group)
          template(v-if='display && nodes.length')
            div(v-for='(node, i) in nodes' :key='node.node_id')
              v-col(cols='12').px-0
                node-controls(:nodeID='node.node_id')
      v-col(cols='12' sm='6' v-else-if='noNodes')
        v-card(color='info' key='no-nodes')
          v-card-text.text-center
            | You dont have any nodes yet.
            br
            | Nodes you create will appear here.
          v-card-actions
            v-btn(to='/create' color='secondary').warning--text.px-6.mx-auto Create Node

</template>
<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { layoutStore, nodeStore } from '~/store'

export default defineComponent({
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  components: {
    AvailableNode: () => import('~/components/AvailableNode.vue'),
    NodeControls: () => import('~/components/viewnode/NodeControls.vue')
  },
  setup () {
    layoutStore.SET_TITLE('Dashboard')
    layoutStore.DRAWER(null)

    const nodes = computed(() => nodeStore.IDNames)

    const display = computed(() => !!nodeStore.user)

    const noNodes = computed(() => nodes.value.length === 0 && display.value)

    return {
      nodes,
      display,
      noNodes
    }
  }
})
</script>
