import { Ref, computed } from '@vue/composition-api'
import { NodeStatus } from '~/types/api' 
import { Node } from '~/types/apiResponse' 

export default function useNodeStatus (node: Ref<Node>) {

    const canStart = computed(() => {
        return node.value.status === NodeStatus.stopped ||
        node.value.status === NodeStatus.failed ||
        node.value.status === NodeStatus.stopping
    })
  
    const canStop = computed(() => {
        return node.value.status === NodeStatus.running ||
        node.value.status === NodeStatus.failed ||
        node.value.status === NodeStatus.starting
    })
  
    const canDelete = computed(() => {
        return node.value.status !== NodeStatus.deleted &&
        node.value.status !== NodeStatus.expired
    })

    const canConnect = computed(() => {
        return node.value.status === NodeStatus.running
    })

    const canInit = computed(() => {
        return node.value.status === NodeStatus.waiting_init
    })

    const canUnlock = computed(() => {
        return node.value.status === NodeStatus.waiting_unlock
    })

    const status = computed(() => {
        return node.value.status
    })

    return {
        canStart,
        canStop,
        canDelete,
        canConnect,
        canInit,
        canUnlock,
        status
    }
}