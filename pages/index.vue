<template lang="pug">
  v-container(cols="12" lg="8")
    v-row(justify="center" align="center")
      v-col(cols="12" md="8" xl='6')
        v-fade-transition(group)
          template(v-if='display')
            v-container(v-for='(node, i) in nodes' :key='node.node_id')
              v-col(cols='12')
                node-controls(:nodeID='node.node_id')

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

      return {
        nodes,
        display
      }
    }
})
</script>
