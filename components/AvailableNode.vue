<template lang="pug">
  v-container
    v-row(justify="center")
      v-col
        v-row
          v-col(cols="12").text-center.display-3.warning--text.font-weight-medium.
            {{ available }}
          v-col(cols="12").text-center.caption.font-italic.font-weight-light.
            Available {{ capitalized }} Nodes
          v-col(cols="12").text-center
            v-btn(
              color="accent"
              :class="{'warning--text': available}"
              :disabled="!available"
              @click="setupNode"
            ).mx-auto.
              Create New Node
</template>
<script lang="ts">
import { defineComponent, ref, computed } from '@vue/composition-api'
import { Network } from '~/types/api'
import { createStore, nodeStore } from '~/store'

export default defineComponent({
  props: {
    network: {
      type: String as () => Network,
      required: true
    }
  },
  setup ({ network }, { root }) {
    const capitalized = computed(() => network.charAt(0).toUpperCase() + network.slice(1))
    const available = computed(() => {
      return (network === 'testnet') ? nodeStore.testnetAvailable : nodeStore.mainnetAvailable
    })
    
    function setupNode () {
      createStore.SEED([])
      createStore.NETWORK(network)
      root.$router.push('/create')
    }

    return {
      capitalized,
      setupNode,
      available,
    }
  }
})
</script>