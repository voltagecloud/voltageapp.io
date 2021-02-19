import { defineComponent, createElement, computed } from '@vue/composition-api'
import { nodeStore } from '~/store'

const h = createElement

export default defineComponent({
  setup: () => {
    const mainnetNodes = computed(() => nodeStore.user?.mainnet_nodes || [])

    return () => <div>
      
    </div>
  }
})

