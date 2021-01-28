<template lang="pug">
v-container
  v-btn(
    block
    @click='showSettings = !showSettings'
    color='secondary'
  ).warning--text {{showSettings ? 'Collapse' : 'Expand'}} Settings
  v-expand-transition
    node-settings(v-if='showSettings' :node='node' @updated='showSettings = false')
</template>
<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import type { Node } from '~/types/apiResponse'

export default defineComponent({
  components: {
    NodeSettings: () => import('~/components/viewnode/NodeSettings.vue')
  },
  props: {
    node: {
      type: Object as () => Node,
      required: true
    }
  },
  setup () {
    const showSettings = ref(false)

    return {
      showSettings
    }
  }
})
</script>
