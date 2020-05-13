import { computed, ref, Ref } from '@vue/composition-api'
import { NodeStatus, Network } from '~/types/api'
import { Node, NodeStatusUpdate } from '~/types/apiResponse'
import { Context } from '@nuxt/types'
import { nodeStore } from '~/store'

export default function useNodeControls (node: Ref<Node>, { $axios }: Context) {

    const canStart = computed(() => {
        return node.value.status == NodeStatus.stopped ||
        node.value.status == NodeStatus.failed ||
        node.value.status == NodeStatus.stopping
    })
  
    const canStop = computed(() => {
        return node.value.status == NodeStatus.running ||
        node.value.status == NodeStatus.failed ||
        node.value.status == NodeStatus.starting
    })
  
    const canDelete = computed(() => {
        return node.value.status != NodeStatus.deleted &&
        node.value.status != NodeStatus.expired
    })

    const loading = ref(false)

    async function deleteNode () {
        loading.value = true
        const res = await $axios.post<NodeStatusUpdate>('/node/delete', { node_id: node.value.node_id })
        loading.value = false
        nodeStore.UPDATE_NODE(res.data)
        return res
    }

    async function startNode () {
        loading.value = true
        const res = await $axios.post<NodeStatusUpdate>('/node/start', { node_id: node.value.node_id })
        loading.value = false
        nodeStore.UPDATE_NODE(res.data)
        return res
    }

    async function stopNode () {
        loading.value = true
        const res = await $axios.post<NodeStatusUpdate>('/node/stop', { node_id: node.value.node_id })
        loading.value = false
        nodeStore.UPDATE_NODE(res.data)
        return res
    }

    return {
        canStart,
        canStop,
        canDelete,
        loading,
        deleteNode,
        startNode,
        stopNode
    }
}