import { ref, Ref } from '@vue/composition-api'
import { Context } from '@nuxt/types'
import { NodeDashboard } from '~/types/apiResponse'
import { dashboardsStore } from '~/store'

export default function useDashboardControls (dashboard: Ref<NodeDashboard>, { $axios, error }: Context) {
  const loading = ref(false)

  async function deleteDashboard () {
    loading.value = true
    try {
      const res = await $axios.post<NodeDashboard>('/dashboards/delete', { dashboard_id: dashboard.value.dashboard_id })
      dashboardsStore.UPDATE_DASHBOARD(res.data)
      loading.value = false
      return res
    } catch (e) {
      loading.value = false
      error({ statusCode: 500 })
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    deleteDashboard
  }
}
