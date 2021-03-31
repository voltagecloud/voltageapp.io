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
    error = ''
    notifications: Notification[] = []
    showDrawer: boolean | null = null

    @Mutation
    SET_ERROR (error: string) {
      this.error = error
    }

    @Mutation
    DRAWER (v: boolean | null) {
      this.showDrawer = v
    }
}
