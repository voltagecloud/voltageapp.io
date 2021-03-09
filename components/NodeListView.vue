<template>
  <VirtualScroll :items="nodes" :height="120" :renderAhead="1">
    <template v-slot:default="{ items }">
      <div v-for="(node, i) in items" :key="`${node.node_id}_${i}`">
        <v-col cols="12" md="10" lg="8" class="mx-auto">
          <node-controls :nodeID="node.node_id" />
        </v-col>
      </div>
    </template>
  </VirtualScroll>
</template>
<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { nodeStore } from '~/store'

export default defineComponent({
  components: {
    VirtualScroll: () => import('~/components/core/VirtualScroll.vue'),
    NodeControls: () => import('~/components/viewnode/NodeControls.vue')
  },
  setup: () => {
    return {
      nodes: computed(() => nodeStore.IDNames)
    }
  }
})
</script>
