import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { Network, Settings } from '~/types/api'

interface NodeTypePayload {
    network: Network
    trial: boolean
}

@Module({
    name: 'create',
    stateFactory: true,
    namespaced: true
})
export default class CreateModule extends VuexModule {
    nodeName: string = ''
    network: Network = Network.testnet
    trial = false
    seed: string[] = []
    settings: Settings = {
        autopilot: true,
        grpc: true,
        rest: false,
        tor: false,
        keysend: false,
        whitelist: []
    }
    newNodeID: string = ''
    currentStep = 0

    @Mutation
    NODE_NAME (name: string) {
        this.nodeName = name
    }

    @Mutation
    STEP (step: number) {
        this.currentStep = step
    }

    @Mutation
    NODE_TYPE ({ network, trial }: NodeTypePayload) {
        this.network = network
        this.trial = trial
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