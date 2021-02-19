<template lang="pug">
  v-container
    v-row(justify="center")
      v-col
        v-row
          v-col(cols="12").text-center.display-3.warning--text.font-weight-medium
            | {{ available }}
          v-col(cols="12").text-center.caption.font-italic.font-weight-light
            | Available {{ capitalized }} Nodes
          v-col(cols="12").text-center
            v-btn(
              color="accent"
              :class="{'warning--text': available}"
              :disabled="!available"
            ).mx-auto
              | Create New Node
</template>
<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { Network } from '~/types/api'
import { nodeStore } from '~/store'

export default defineComponent({
  props: {
    network: {
      type: String as () => Network,
      required: true
    }
  },
  setup (props) {
    const capitalized = computed(() => props.network.charAt(0).toUpperCase() + props.network.slice(1))
    const available = computed(() => {
      return (props.network === 'testnet') ? nodeStore.testnetAvailable : nodeStore.mainnetAvailable
    })

    return {
      capitalized,
      available
    }
  }
})
</script>
