<template lang="pug">
  v-card(color='secondary')
    v-card-title Dashboards
      v-container
        p(style='font-size: 13px; padding-bottom: 0px; word-wrap: break-word;' no-gutters).font-weight-light
          | Dashboards expire after 30 minutes of inactivity or a max-life of 3 hours. You can provision as many as you want, but can only have 1 dashboard running per node at a time.
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
import { defineComponent, ref, computed } from '@vue/composition-api'
import { DashboardData } from '~/types/api'
import useNodeApi from '~/compositions/useNodeApi'
import { dashboardsStore } from '~/store'
import { NodeDashboardStatus, NodeDashboard } from '~/types/apiResponse'

let timerID: NodeJS.Timeout

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
    const chosenDashboard = ref(DashboardData.thunderhub)
    const dashboardTypes = [Object.values(DashboardData)]
    const errorMessage = ref('')
    const runningDashboard = ref(false)
    const newDashboard = ref(false)
    const isChecking = ref(false)
    const { getDashboards, createDashboard, loading } = useNodeApi(root.$nuxt.context)
    const filteredDashboards = computed(() => {
      return dashboardsStore.dashboards.filter((exp) => {
        if (exp.node_id === props.nodeID && exp.status !== "deleted") {
          return true
        }
        return false
      })
    })

    async function checkRunningDashboard() {
      let runningList = dashboardsStore.dashboards.filter(elem => elem.node_id === props.nodeID && elem.status !== "deleted")
      if (runningList.length > 0) {
        intervalCheck()
        runningDashboard.value = true
        newDashboard.value = false
      } else {
        runningDashboard.value = false
        newDashboard.value = true
      }
      return
    }

    async function intervalCheck() {
      if (isChecking.value) {
        return
      }
      // @ts-ignore
      const axios = root.$nuxt.context.$axios
      // @ts-ignore
      const res = await axios.get('/dashboards')
      await dashboardsStore.DASHBOARDS(res.data.dashboards)
      if (dashboardsStore.shouldRefresh && !timerID) {
        isChecking.value = true
        // make suer interval is clean
        // set new interval
        const timerID = setInterval(async () => {
          // If the user leaves the page stop checking
          // @ts-ignore
          if (root.$nuxt.context.route.name !== 'node-id') {
            isChecking.value = false
            clearInterval(timerID)
          }
          const res = await axios.get('/dashboards')
          dashboardsStore.DASHBOARDS(res.data.dashboards)
          if (!dashboardsStore.shouldRefresh) {
            isChecking.value = true
            clearInterval(timerID)
          }
        }, 5000)
      }
    }

    async function provisionDashboard() {
      loading.value = true
      let newDash = await createDashboard(props.nodeID, 'thunderhub')
      runningDashboard.value = true
      newDashboard.value = false
      await intervalCheck()
    }

    function createNew() {
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
