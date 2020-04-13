import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { Network, Settings } from '~/types/api'

@Module({
    name: 'create',
    stateFactory: true,
    namespaced: true
})
export default class CreateModule extends VuexModule {
    nodeName: string = ''
    network: Network = Network.testnet
    seed: string[] = []
    settings: Settings = {
        autopilot: true,
        grpc: true,
        rest: false,
        watchtower_client: false,
        tor: false,
        whitelist: []
    }
    newNodeID: string = ''

    @Mutation
    NODE_NAME (name: string) {
        this.nodeName = name
    }

    @Mutation
    NETWORK (network: Network) {
        this.network = network
    }

    @Mutation
    SEED (seed: string[]) {
        this.seed = seed
    }

    @Mutation
    SETTINGS (settings: Settings) {
        this.settings = Object.assign({}, this.settings, settings)
    }

    @Mutation
    NEW_NODE_ID (nodeID: string) {
        this.newNodeID = nodeID
    }

    @Mutation
    HYDRATE_SETTINGS (settings: Settings) {
        this.settings = Object.assign(this.settings, settings)
    }
}