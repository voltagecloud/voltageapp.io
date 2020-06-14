import { ref, Ref } from '@vue/composition-api'
import { MacaroonLevel, ApiType } from '~/types/api'
import { Node, NodeStatusUpdate, Connect } from '~/types/apiResponse'
import { Context } from '@nuxt/types'
import { nodeStore } from '~/store'

export default function useNodeControls (node: Ref<Node>, { $axios }: Context) {

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

    async function connect (macaroon: MacaroonLevel, api: ApiType) {
        loading.value = true
        const res = await $axios.post<Connect>('/node/connect', {
            node_id: node.value.node_id,
            macaroon,
            api
        })
        loading.value = false
        return res
    }

    return {
        loading,
        deleteNode,
        startNode,
        stopNode,
        connect
    }
}