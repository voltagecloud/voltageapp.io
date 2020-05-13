import { Ref, computed, ref } from '@vue/composition-api'
import { NodeStatus, Network } from '~/types/api'
import { Node } from '~/types/apiResponse'
import { Context } from '@nuxt/types'

export default function useNodeControls (node: Ref<Node>, { $axios }: Context) {
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

    const loading = ref(false)

    async function deleteNode () {
        loading.value = true
        const res = await $axios.post('/node/delete', { node_id: node.value.node_id })
        loading.value = false
        return res
    }

    async function startNode () {
        loading.value = true
        const res = await $axios.post('/node/start', { node_id: node.value.node_id })
        loading.value = false
        return res
    }

    async function stopNode () {
        loading.value = true
        const res = await $axios.post('/node/stop', { node_id: node.value.node_id })
        loading.value = false
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