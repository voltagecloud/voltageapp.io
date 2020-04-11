import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { IDName } from '~/types/api'


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
    

}