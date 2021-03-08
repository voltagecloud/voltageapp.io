import { Ref, computed } from '@vue/composition-api'
import { NodeStatus } from '~/types/api'
import { Node } from '~/types/apiResponse'

export default function useNodeStatus (node: Ref<Node|null>) {
  const canStart = computed(() => {
    if (!node.value) return false
    return node.value.status === NodeStatus.stopped ||
        node.value.status === NodeStatus.failed ||
        node.value.status === NodeStatus.stopping
  })

  const canStop = computed(() => {
    if (!node.value) return false
    return node.value.status === NodeStatus.running ||
        node.value.status === NodeStatus.failed ||
        node.value.status === NodeStatus.starting ||
        node.value.status === NodeStatus.waiting_init ||
        node.value.status === NodeStatus.waiting_unlock ||
        node.value.status === NodeStatus.restarting ||
        node.value.status === NodeStatus.unlocking ||
        node.value.status === NodeStatus.initializing
  })

  const canDelete = computed(() => {
    if (!node.value) return false
    return node.value.status !== NodeStatus.deleted &&
        node.value.status !== NodeStatus.expired
  })

  const canConnect = computed(() => {
    if (!node.value) return false
    return node.value.status === NodeStatus.running
  })

  const canInit = computed(() => {
    if (!node.value) return false
    return node.value.status === NodeStatus.waiting_init
  })

  const canUnlock = computed(() => {
    if (!node.value) return false
    return node.value.status === NodeStatus.waiting_unlock
  })

  const canUpdate = computed(() => {
    if (!node.value) return false
    return node.value.update_available === true
  })

  const status = computed(() => {
    return node.value ? node.value.status : ''
  })

  const helperText = computed(() => {
    if (!node.value) return false
    if (node.value.status === NodeStatus.waiting_init) {
      return 'Your node is waiting to be initialized.'
    } else if (node.value.status === NodeStatus.initializing) {
      return 'Your node is being initialized. Please do not close your browser until the node is running.'
    } else if (node.value.status === NodeStatus.provisioning) {
      return 'Your node is being created. Please leave your browser open for initialization.'
    } else if (node.value.status === NodeStatus.waiting_unlock) {
      return 'Your node is waiting to be unlocked.'
    } else {
      return ''
    }
  })

  return {
    canStart,
    canStop,
    canDelete,
    canConnect,
    canInit,
    canUnlock,
    canUpdate,
    status,
    helperText
  }
}
