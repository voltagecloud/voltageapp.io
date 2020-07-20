import { Module, VuexModule, Mutation } from 'vuex-module-decorators'

@Module({
    name: 'invite',
    stateFactory: true,
    namespaced: true
})
export default class InviteModule extends VuexModule {
    invited: boolean = false

    @Mutation
    SET_INVITE (invited: true | false) {
        this.invited = invited
    }
}