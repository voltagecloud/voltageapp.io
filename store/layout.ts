import { Module, VuexModule, Mutation } from 'vuex-module-decorators'

@Module({
    name: 'layout',
    stateFactory: true,
    namespaced: true
})
export default class LayoutModule extends VuexModule {
    appBarTitle = 'Dashboard'
    error = ''

    @Mutation
    SET_TITLE (title: string) {
        this.appBarTitle = title
    }

    @Mutation
    SET_ERROR (error: string) {
        this.error = error
    }
}
