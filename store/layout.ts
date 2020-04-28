import { Module, VuexModule, Mutation } from 'vuex-module-decorators'

interface Notifications {
    title: string
    to: string
}

@Module({
    name: 'layout',
    stateFactory: true,
    namespaced: true
})
export default class LayoutModule extends VuexModule {
    appBarTitle = 'Dashboard'
    error = ''
    notifications: Notification[] = []
    showDrawer: boolean | null = null

    @Mutation
    SET_TITLE (title: string) {
        this.appBarTitle = title
    }

    @Mutation
    SET_ERROR (error: string) {
        this.error = error
    }

    @Mutation
    DRAWER (v: boolean | null) {
        this.showDrawer = v
    }
}
