import { defineComponent, computed } from '@vue/composition-api'
import JsonTable, { JsonData } from '~/components/core/JsonTable'
import { useRoute } from '@nuxtjs/composition-api'
import { nodeStore } from '~/store'
import { VContainer } from 'vuetify/lib'
import NodeControls from '~/components/viewnode/NodeControls.vue'

export default defineComponent({
  setup: () => {
    const route = useRoute()

    const data = computed(() => nodeStore.nodeData(route.value.params.id))

    return () => <VContainer>
      <NodeControls nodeID={route.value.params.id} 
        {
          ...{
            scopedSlots: {
              "append-content": () => <JsonTable data={() => data.value as unknown as JsonData} />
            }
          }
        }
      >
      </NodeControls>
    </VContainer>
  }
})

