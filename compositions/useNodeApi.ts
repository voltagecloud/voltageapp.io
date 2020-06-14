import { Context } from '@nuxt/types'
import { createStore, nodeStore, layoutStore, exportsStore } from '~/store'
import { NodeSeed, Node, CreateNode, PopulateNode } from '~/types/apiResponse'
import { Settings, Network, ExportData } from '~/types/api'
import { ref } from '@vue/composition-api'


export default function useNodeApi ({ $axios }: Context) {
    const loading = ref(false)

    async function generateSeed (name: string, network: Network, purchased: boolean) {
        loading.value = true
        try {
            const seed = await $axios.post<NodeSeed>(
                '/node/seed',
                {
                    name,
                    network,
                    purchased_type: purchased ? 'trial' : 'paid'
                }
            )
            createStore.NODE_NAME(name)
            createStore.SEED(seed.data?.seed)
            return seed
        } catch (e) {
            layoutStore.SET_ERROR(e)
        } finally {
            loading.value = false
        }
    }

    async function createNode () {
        loading.value = true
        const node = await $axios.post<CreateNode>(
            '/node/create',
            {
                network: createStore.network,
                purchased_type: createStore.trial ? 'trial' : 'paid'
            }
        )
        createStore.NEW_NODE_ID(node.data?.['node_id'])
        loading.value = false
        return node
    }

    async function populateNode () {
        loading.value = true
        const node = await $axios.post<PopulateNode>(
            '/node/populate',
            {
                node_id: createStore.newNodeID,
                name: createStore.nodeName,
                settings: createStore.settings
            }
        )
        loading.value = false
        return node
    }

    async function postNode (id:string) {
        loading.value = true
        const node = await $axios.post<Node>('/node', {
            node_id: id
        })
        nodeStore.ADD_NODE(node.data)
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
        nodeStore.ADD_NODE(res.data)
        loading.value = false
        return res
    }

    async function startExport (id: string, exportData: ExportData) {
        loading.value = true
        const res = await $axios.post('/export', {
            node_id: id,
            type: exportData
        })
        loading.value = false
        exportsStore.ADD_EXPORT(res.data)
        return res
    }


    return {
        generateSeed,
        createNode,
        populateNode,
        postNode,
        updateSettings,
        loading,
        startExport
    }
}