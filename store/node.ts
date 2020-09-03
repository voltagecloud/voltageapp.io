import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { IDName, Network } from '~/types/api'
import { Node, User, NodeStatusUpdate } from '~/types/apiResponse'

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
    user: User | null = null
    purchased = 0
    mainnetAvailable = 0
    mainnetNodeIDName: IDName[] = []

    testnetAvailable = 0
    testnetNodeIDName: IDName[] = []
    
    nodes: Node[] = []

    @Mutation
    HYDRATE_USER(user: User) {
        this.user = user
    }

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
            this.testnetNodeIDName = [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s))
        } else if (network === 'mainnet') {
            const a = [...this.mainnetNodeIDName, ...idName]
            this.mainnetNodeIDName = [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s))
        }
    }

    @Mutation
    ADD_NODE (node: Node) {
        const uniqueNodes = this.nodes.filter(nodeObj => nodeObj.node_id !== node.node_id)
        this.nodes = [...uniqueNodes, node]
    }

    @Mutation
    UPDATE_NODE (payload: NodeStatusUpdate) {
        this.nodes = this.nodes.map(nodeObj => {
            if (nodeObj.node_id == payload.node_id) {
                return Object.assign({}, nodeObj, payload)
            }
            return nodeObj
        })
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

    get IDNames () {
        if (this.user) {
            return [...this.user.testnet_nodes, ...this.user.mainnet_nodes].sort((a, b) => a.node_name > b.node_name ? 1 : -1)
        }
        return []
    }
}