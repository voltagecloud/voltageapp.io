import { defineComponent, PropType, computed } from '@vue/composition-api'
import { macaroonStore } from '~/store'
import type { Node } from '~/types/apiResponse'

export default defineComponent({
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true
    }
  },
  setup: (props) => {
    const macaroonHex = computed(() => macaroonStore.macaroonState({ nodeId: props.node.node_id, type: 'admin' }).macaroonHex)
    return () => <div>
      
    </div>
  }
})

