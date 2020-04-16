import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { IDName, Network } from '~/types/api'
import { Node } from '~/types/apiResponse'

interface AvailablePayload {
    network: Network
    available: number
}

interface NodeIDPayload {
    network: Network
    idName: IDName[]
}

@Module({
    name: 'node',
    stateFactory: true,
    namespaced: true
})
export default class NodeModule extends VuexModule {
    purchased = 0
    mainnetAvailable = 0
    mainnetNodeIDName: IDName[] = []

    testnetAvailable = 0
    testnetNodeIDName: IDName[] = []
    
    nodes: Node[] = []

    @Mutation
    SET_AVAILABLE ({network, available}: AvailablePayload) {
        if (network == 'testnet') {
            this.testnetAvailable = available
        } else if (network == 'mainnet') {
            this.mainnetAvailable = available
        }
    }

    @Mutation
    SET_NODE_IDS ({ network, idName }: NodeIDPayload) {
        if (network === 'testnet') {
            const a = [...this.testnetNodeIDName, ...idName]
            console.log({ a })
            this.testnetNodeIDName = [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s))
        } else if (network === 'mainnet') {
            const a = [...this.mainnetNodeIDName, ...idName]
            this.mainnetNodeIDName = [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s))
        }
    }

    @Mutation
    UPDATE_NODES (node: Node) {
        const uniqueNodes = this.nodes.filter(nodeObj => nodeObj.node_id !== nodeObj.node_id)
        this.nodes = [...uniqueNodes, node]
    }

    // @Mutation
    // PURGE_NODE ({ id, network }: PurgePayload) {
    //     this.nodes = this.nodes.filter(n => n.node_id !== id)
    //     if (network == 'testnet')
    //         this.testnetNodeIDName = this.testnetNodeIDName.filter(n => n.node_id !== id)
    //     else if (network == 'mainnet') {
    //         this.mainnetNodeIDName = this.mainnetNodeIDName.filter(n => n.node_id !== id)
    //     }
    // }

    @Mutation
    PURCHASED (purchased: number) {
        this.purchased = purchased
    }

    get mainnetNodes () {
        return this.nodes.filter(node => node.network === 'mainnet')
    }

    get testnetNodes () {
        return this.nodes.filter(node => node.network === 'testnet')
    }
}