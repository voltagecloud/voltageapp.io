import { Context } from '@nuxt/types'
import { createStore, nodeStore, layoutStore } from '~/store'
import { NodeSeed, Node } from '~/types/apiResponse'
import { Settings } from '~/types/api'

export default function useNodeApi ({ $axios }: Context) {
    async function generateSeed () {
        const seed = await $axios.post<NodeSeed>(
            '/node/seed',
            {
                name: createStore.nodeName,
                network: createStore.network
            }
        )
        createStore.SEED(seed.data?.seed)
        return seed
    }

    async function createNode () {
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
                id: node.data?.node_id,
                name: node.data?.node_name
            }]
        })
        return node
    }

    async function postNode (id:string) {
        const node = await $axios.post<Node>('/node', {
            node_id: id
        })
        nodeStore.UPDATE_NODES(node.data)
        createStore.HYDRATE_SETTINGS(node.data.settings)
        return node.data
    }

    async function updateSettings (id: string, settings: Settings) {
        const res = await $axios.post('/node/settings',{
            node_id: id,
            settings
        })
        nodeStore.UPDATE_NODES(res.data)
    }

    return {
        generateSeed,
        createNode,
        postNode,
        updateSettings
    }
}