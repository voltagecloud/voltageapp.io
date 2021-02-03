import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { NodeDashboard, NodeDashboardStatus } from '~/types/apiResponse'

@Module({
  name: 'dashboards',
  stateFactory: true,
  namespaced: true
})
export default class DashboardsModule extends VuexModule {
  dashboards: NodeDashboard[] = []

  @Mutation
  ADD_DASHBOARD (data: NodeDashboard) {
    const uniqueDashboards = this.dashboards.filter(elem => elem.node_id !== data.node_id)
    this.dashboards = [...uniqueDashboards, data]
  }

  @Mutation
  DASHBOARDS (data: NodeDashboard[]) {
    this.dashboards = data
  }

  @Mutation
  UPDATE_DASHBOARD (payload: NodeDashboard) {
    this.dashboards = this.dashboards.map((dashboardObj) => {
      if (dashboardObj.dashboard_id === payload.dashboard_id) {
        return Object.assign({}, dashboardObj, payload)
      }
      return dashboardObj
    })
  }

  get shouldRefresh () {
    return this.dashboards.some(elem => elem.status === NodeDashboardStatus.provisioning)
  }
}
