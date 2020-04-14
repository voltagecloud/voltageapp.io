import { Context, Middleware } from '@nuxt/types'
import { nodeStore, authStore } from '~/store'
import { Network } from '~/types/api'

const loadNodes: Middleware = async ({ store, $axios }: Context) => {
    const testnetUnloaded = nodeStore.testnetNodeIDName.length === 0
    const mainUnloaded = nodeStore.mainnetNodeIDName.length === 0
    if (!!authStore.user && testnetUnloaded || mainUnloaded) {
        try {
            const userRes = await $axios.get('/user')
            console.log({ userRes })
            nodeStore.SET_AVAILABLE({
                network: Network.testnet,
                available: userRes.data?.['available_testnet_nodes']
            })
            nodeStore.SET_AVAILABLE({
                network: Network.mainnet,
                available: userRes.data?.['available_mainnet_nodes']
            })
            nodeStore.PURCHASED(userRes.data?.['purchased_mainnet_nodes'])
            nodeStore.SET_NODE_IDS({
                network: Network.testnet,
                idName: userRes.data?.['testnet_nodes']
            })
            nodeStore.SET_NODE_IDS({
                network: Network.mainnet,
                idName: userRes.data?.['mainnet_nodes']
            })
        } catch (error) {
            console.log({ error })
        }
    }
}

export default loadNodes