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
    RESET () {
      this.nodes = []
      this.purchased = 0
      this.mainnetAvailable = 0
      this.mainnetNodeIDName = []
      this.testnetAvailable = 0
      this.testnetNodeIDName = []
      this.user = null
    }

    @Mutation
    HYDRATE_USER ({ user, nodes }: { user: User; nodes: Node[]; }) {
      this.user = user
      this.nodes = nodes
    }

    @Mutation
    SET_AVAILABLE ({ network, available }: AvailablePayload) {
      if (network === 'testnet') {
        this.testnetAvailable = available
      } else if (network === 'mainnet') {
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
      this.nodes = this.nodes.map((nodeObj) => {
        if (nodeObj.node_id === payload.node_id) {
          return Object.assign({}, nodeObj, payload)
        }
        return nodeObj
      })
    }

    @Mutation
    SET_SHOWED_TRIAL (shown: boolean) {
      localStorage.setItem('showedTrial', shown.toString())
      return shown
    }

    get IDNames () {
      if (this.nodes.length) {
        return [...this.nodes].sort((a, b) => (a.created || 0) > (b.created || 0) ? -1 : 1)
      }
      return []
    }

}
