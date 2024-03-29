<template lang="pug">
  v-card(color='secondary')
    v-card-title Dashboards
      v-container
        p(style='font-size: 13px; padding-bottom: 0px; word-wrap: break-word;' no-gutters).font-weight-light
          | Dashboards expire after 60 minutes of inactivity or a max-life of 6 hours. You can provision as many as you want, but can only have 1 dashboard running per node at a time.
      v-container(v-if='!runningDashboard')
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
      v-container(v-else='runningDashboard' fluid)
        v-row(justify='center' no-gutters)
          v-col(v-if='filteredDashboards.length > 0' cols='12' v-for='(dashboardData, i) in filteredDashboards' :key='dashboardData.dashboard_id')
            node-dashboard(:dashboardID='dashboardData.dashboard_id' :includeNodeButton='false' @delete='() => runningDashboard = false')
            br
          v-col(cols='12' v-else)
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
      console.log({ runningList })
      if (runningList.length > 0) {
        intervalCheck()
        runningDashboard.value = true
      } else {
        runningDashboard.value = false
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
      await intervalCheck()
    }

    function createNew () {
      runningDashboard.value = false
    }

    checkRunningDashboard()

    return {
      errorMessage,
      loading,
      runningDashboard,
      provisionDashboard,
      filteredDashboards,
      createNew,
      checkRunningDashboard
    }
  }
})
</script>
