<template lang="pug">
  v-card(color='info')
    v-progress-linear(indeterminate absolute top v-if='isPending')
    v-card-title
      v-row(align='center' justify='space-between' no-gutters)
        v-col(cols='auto')
          v-row(no-gutters)
            v-col(cols='12').font-weight-light.warning--text.text--darken-1.v-card__title
              span
                img(src="/images/thunderhub.png" width="150" style="padding-right: 10px; padding-top: 10px")
              span {{ dashboardData.node_name }}
              span.caption.warning--text.ml-2 {{ dashboardData.status }}
        v-col(cols='auto')
          v-row(justify='end')

            v-tooltip(top :open-on-click="true" :open-on-hover="true" v-if='nodeButton')
              template(v-slot:activator="{ on }")
                v-btn(icon v-bind="$attrs" v-on="on" :to='`/node/${dashboardData.node_id}`').mx-1
                  v-icon mdi-forward
              span
                | Go to Node
            v-tooltip(top :open-on-click="true" :open-on-hover="true")
              template(v-slot:activator="{ on }")
                v-btn(icon v-bind="$attrs" v-on="on" :href='"https://" + dashboardData.endpoint' target='_blank' :disabled='isPending').ml-1.mr-3
                  v-icon mdi-laptop
              span
                | Open Dashboard
            v-tooltip(top :open-on-click="true" :open-on-hover="true")
              template(v-slot:activator="{ on }")
                v-btn(icon v-bind="$attrs" v-on="on" @click='delDash').ml-1.mr-3
                  v-icon mdi-delete
              span
                | Delete Dashboard
        
    p(v-if='isPending' style="padding-left: 30px").font-weight-light.warning--text.text--darken-1
      | Provisioning takes approximately 45 seconds
    v-container
      JsonTable(:data='dashboardInfo')
</template>
<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import { dashboardsStore } from '../store'
import useDashboardControls from '~/compositions/useDashboardControls'
import { NodeDashboardStatus } from '~/types/apiResponse'

export default defineComponent({
  props: {
    dashboardID: {
      required: true,
      type: String
    },
    includeNodeButton: {
      required: true,
      type: Boolean
    }
  },
  components: {
    CopyPill: () => import('~/components/core/CopyPill.vue'),
    JsonTable: () => import('~/components/core/JsonTable')
  },
  setup ({ dashboardID, includeNodeButton }, { root, emit }) {
    const dashboardData = computed(() => dashboardsStore.dashboards.filter(elem => elem.dashboard_id === dashboardID)[0])
    const isPending = computed(() => dashboardData.value.status === NodeDashboardStatus.provisioning)
    const nodeButton = ref(includeNodeButton)

    const dashboardInfo = computed(() => () => ({
      'Endpoint': `https://${dashboardData.value.endpoint}`,
      Type: dashboardData.value.type,
      'Status': dashboardData.value.status,
      'Node Name': dashboardData.value.node_name,
      'Dashboard Name': dashboardData.value.dashboard_name
    }))

    const { deleteDashboard } = useDashboardControls(dashboardData, root.$nuxt.context)

    async function delDash () {
      emit('delete')
      await deleteDashboard()
    }

    return {
      isPending,
      dashboardInfo,
      dashboardData,
      deleteDashboard,
      nodeButton,
      delDash
    }
  }
})
</script>
