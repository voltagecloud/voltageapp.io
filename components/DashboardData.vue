<template lang="pug">
  v-card(color='secondary')
    v-card-title Dashboards
      v-container(v-if='newDashboard')
        v-card-actions
          v-container
            v-row(justify='center' no-gutters)
              v-col(cols='12')
                div(justify='center' align='center' style='margin: auto;')
                  v-row(style='padding-bottom: 50px')
                    v-col(cols='12' lg='6')
                      v-btn(fab icon tile raised elevation="12" style='border-radius: 5px; border: solid; border-color: #1d437b; background: #ffffff;  width: 200px; height: 150px;')
                        v-col
                          img(src="/images/thunderhub.png" width="150")
                    v-col(cols='12' lg='6')
                      v-btn(fab icon tile raised elevation="12" :disabled='true' style='background: #e4e4e4; border-radius: 5px; width: 200px; height: 150px;')
                        v-col
                          img(src="/images/rtl.png" width="100" style="padding-bottom: 10px")
                          br
                          | Not Yet Available
              v-col(cols='12')
                v-btn(color='info' @click='provisionDashboard' :loading='loading' block).warning--text Create Dashboard
      v-container(v-else-if='runningDashboard')
        v-card-actions
          v-container
            v-row(justify='center' no-gutters)
              v-container(v-if='filteredDashboards.length > 0')
                v-col(cols='12' v-for='(dashboardData, i) in filteredDashboards' :key='dashboardData.dashboard_id')
                  node-dashboard(:dashboardID='dashboardData.dashboard_id' :includeNodeButton='false')
                  br
              v-container(v-else)
                | You don't have any running Dashboards
                br
                a(@click='createNew')  Create a new one
</template>
<script lang="ts">
import { defineComponent, ref, computed, onBeforeUnmount } from '@vue/composition-api'
import useNodeApi from '~/compositions/useNodeApi'
import { dashboardsStore } from '~/store'

export default defineComponent({
  props: {
    nodeID: {
      type: String,
      required: true
    }
  },
  components: {
    NodeDashboard: () => import('~/components/NodeDashboard.vue')
  },
  setup (props, { root }) {
    const errorMessage = ref('')
    const runningDashboard = ref(false)
    const newDashboard = ref(false)
    const { createDashboard, loading } = useNodeApi(root.$nuxt.context)
    const filteredDashboards = computed(() => {
      return dashboardsStore.dashboards.filter((exp) => {
        if (exp.node_id === props.nodeID && exp.status !== 'deleted') {
          return true
        }
        return false
      })
    })
    const unMounting = ref(false)
    onBeforeUnmount(() => { unMounting.value = true })

    function checkRunningDashboard () {
      const runningList = dashboardsStore.dashboards.filter(elem => elem.node_id === props.nodeID && elem.status !== 'deleted')
      if (runningList.length > 0) {
        intervalCheck()
        runningDashboard.value = true
        newDashboard.value = false
      } else {
        runningDashboard.value = false
        newDashboard.value = true
      }
    }

    async function intervalCheck () {
      if (!dashboardsStore.shouldRefresh || unMounting.value) { return }
      const axios = root.$nuxt.context.$axios
      const res = await axios.get('/dashboards')
      dashboardsStore.DASHBOARDS(res.data.dashboards)

      setTimeout(async () => {
        await intervalCheck()
      }, 5000)
    }

    async function provisionDashboard () {
      loading.value = true
      await createDashboard(props.nodeID, 'thunderhub')
      runningDashboard.value = true
      newDashboard.value = false
      await intervalCheck()
    }

    function createNew () {
      runningDashboard.value = false
      newDashboard.value = true
    }

    checkRunningDashboard()

    return {
      errorMessage,
      loading,
      runningDashboard,
      newDashboard,
      provisionDashboard,
      filteredDashboards,
      createNew
    }
  }
})
</script>
