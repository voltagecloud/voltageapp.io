import { Ref, computed } from '@vue/composition-api'
import { NodeStatus } from '~/types/api'
import { Node } from '~/types/apiResponse'

export default function useNodeControls (node: Ref<Node>) {
    const canStart = computed(() => {
        node.value.status == NodeStatus.stopped ||
        node.value.status == NodeStatus.failed
    })
  
    const canStop = computed(() => {
        node.value.status == NodeStatus.running ||
        node.value.status == NodeStatus.failed
    })
  
    const canDelete = computed(() => {
        node.value.status != NodeStatus.deleted &&
        node.value.status != NodeStatus.expired
    })

    return {
        canStart,
        canStop,
        canDelete
    }
}