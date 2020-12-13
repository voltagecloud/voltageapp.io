<template lang="pug">
  v-container
    v-row(
      v-if='!loading && !filteredDashboards.length'
      justify='center'
      align='center'
      style='height: 100%;'
    )
      v-col(col='12').text-center
        v-card
          v-card-text.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
            | You have no running dashboards
    v-row(v-else justify='center')
      v-col(cols='12')
        v-fade-transition(group)
          v-col(cols='12' v-for='(dashboardData, i) in filteredDashboards' :key='dashboardData.dashboard_id')
            node-dashboard(:dashboardID='dashboardData.dashboard_id')
</template>
<script lang="ts">
import { defineComponent, SetupContext, computed, ref } from '@vue/composition-api'
import { dashboardsStore } from '~/store'

let timerID: NodeJS.Timeout

export default defineComponent({
  components: {
    NodeDashboard: () => import('~/components/NodeDashboard.vue')
  },
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  async fetch () {
    // @ts-ignore
    this.loading = true
    // @ts-ignore
    const axios = this.$nuxt.context.$axios
    // @ts-ignore
    const res = await axios.get('/dashboards')
    dashboardsStore.DASHBOARDS(res.data.dashboards)
    // @ts-ignore
    this.loading = false
    if (dashboardsStore.shouldRefresh && !timerID) {
      // make suer interval is clean
      // set new interval
      const timerID = setInterval(async () => {
        // If the user leaves the page stop checking
        // @ts-ignore
        if (this.$route.name !== 'dashboards') {
          clearInterval(timerID)
        }
        const res = await axios.get('/dashboards')
        dashboardsStore.DASHBOARDS(res.data.dashboards)
        if (!dashboardsStore.shouldRefresh) {
          clearInterval(timerID)
        }
      }, 5000)
    }
  },
  setup (_, { root }) {
    const loading = ref(false)

    const filteredDashboards = computed(() => {
      return dashboardsStore.dashboards.filter((exp) => {
        if (exp.status === "deleted") {
          return false
        }
        const query = root.$route.query.filter
        if (query) {
          return query.includes(exp.dashboard_id)
        }
        return true
      })
    })

    return {
      filteredDashboards,
      loading
    }
  }
})
</script>
