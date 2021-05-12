import { Action, Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { IDName, Network } from '~/types/api'
import { Node, User, NodeStatusUpdate, BitcoindNode, BtcdNode, NodeSoftware } from '~/types/apiResponse'
import { voltageFetch } from '~/utils/fetchClient'

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
    mainnetNodeIDName: IDName[] = []

    testnetNodeIDName: IDName[] = []

    nodes: Node[] = []
    bitcoindNodes: BitcoindNode[] = []
    btcdNodes: BtcdNode[] = []

    // cache of node /getinfo with node id key
    nodeInfo: Record<string, Record<string, any>> = {} 

    @Mutation
    NODE_INFO({id, payload}: {id: string; payload: Record<string,any>|null}) {
      if (!payload) return
      this.nodeInfo = Object.assign({}, this.nodeInfo, { [id]: payload })
    }

    @Mutation
    RESET () {
      this.nodes = []
      this.bitcoindNodes = []
      this.btcdNodes = []
      this.purchased = 0
      this.mainnetNodeIDName = []
      this.testnetNodeIDName = []
      this.user = null
    }

    @Mutation
    HYDRATE_USER ({ user, nodes }: { user?: User; nodes: Array<Node|BtcdNode|BitcoindNode>; }) {
      if (user) {
        this.user = user
      }
      this.nodes = nodes.filter(n => n.node_type === NodeSoftware.lnd) as Node[]
      this.bitcoindNodes = nodes.filter(n => n.node_type === NodeSoftware.bitcoind) as BitcoindNode[]
      this.btcdNodes = nodes.filter(n => n.node_type === NodeSoftware.btcd) as BtcdNode []
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
      let updated = false
      const newData = this.nodes.map(n => {
        if (n.node_id === node.node_id) {
          updated = true
          return Object.assign({}, n, node)
        }
        return n
      })
      this.nodes = updated ? newData : [...newData, Object.assign({}, node, {node_type: 'lnd'})]
    }

    @Action
    async FETCH_NODE(node_id: string) {
      const res = await voltageFetch('/node', {
        method: 'POST',
        body: JSON.stringify({
          node_id
        })
      })
      const js = await res.json()
      this.ADD_NODE(js as Node)
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

    get nodeData() {
      return (id: string) => {
        return [...this.bitcoindNodes, ...this.btcdNodes, ...this.nodes].find(node => node.node_id === id)
      }
    }

    get nodeNetwork() {
      return (network: Network) => {
        return this.nodes.filter(n => n.network === network)
      }
    }

    get allNodes() {
      return [...this.bitcoindNodes, ...this.btcdNodes, ...this.nodes]
    }

}
