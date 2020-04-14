import { Context } from '@nuxt/types'
import { createStore, nodeStore, layoutStore } from '~/store'
import { NodeSeed, Node } from '~/types/apiResponse'
import { Settings, Network } from '~/types/api'
import { ref } from '@vue/composition-api'

export default function useNodeApi ({ $axios }: Context) {
    const loading = ref(false)

    async function generateSeed (name: string, network: Network) {
        loading.value = true
        createStore.NODE_NAME(name)
        const seed = await $axios.post<NodeSeed>(
            '/node/seed',
            {
                name,
                network
            }
        )
        createStore.SEED(seed.data?.seed)
        loading.value = false
        return seed
    }

    async function createNode () {
        loading.value = true
        const node = await $axios.post<Node>(
            '/node/create',
            {
                network: createStore.network,
                name: createStore.nodeName,
                seed: createStore.seed,
                settings: createStore.settings
            }
        )
        createStore.NEW_NODE_ID(node.data?.['node_id'])
        nodeStore.UPDATE_NODES(node.data)
        nodeStore.SET_NODE_IDS({
            network: node.data?.network,
            idName: [{
                node_id: node.data?.node_id,
                node_name: node.data?.node_name
            }]
        })
        loading.value = false
        return node
    }

    async function postNode (id:string) {
        loading.value = true
        const node = await $axios.post<Node>('/node', {
            node_id: id
        })
        nodeStore.UPDATE_NODES(node.data)
        createStore.HYDRATE_SETTINGS(node.data.settings)
        loading.value = false
        return node.data
    }

    async function updateSettings (id: string, settings: Settings) {
        loading.value = true
        const res = await $axios.post('/node/settings',{
            node_id: id,
            settings
        })
        loading.value = false
        nodeStore.UPDATE_NODES(res.data)
    }

    return {
        generateSeed,
        createNode,
        postNode,
        updateSettings,
        loading
    }
}