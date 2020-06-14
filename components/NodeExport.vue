<template lang="pug">
  v-card(color='info')
    v-progress-linear(indeterminate absolute top v-if='isPending')
    v-card-title
      v-row(align='center' justify='space-between' no-gutters)
        v-col(cols='auto')
          v-row(no-gutters)
            v-col(cols='12').font-weight-light.warning--text.text--darken-1.v-card__title
              span {{ exportData.name }}
              span.hidden-xs-only.caption.warning--text.ml-2 {{ exportData.status }}
            //- v-col(cols='12').overline
            //-   | {{ nodeData.purchased_type=='trial' ? 'Testnet (trial)' : nodeData.network }}
        v-col(cols='auto')
          v-row(justify='end')
            v-btn(icon :to='`/node/${exportData.node_id}`').mx-1
              v-icon mdi-forward
            v-btn(icon :href='exportData.url' target='_blank' :disabled='isPending').ml-1.mr-3
              v-icon mdi-download
    v-container
      v-simple-table(
        :style='{"background-color": $vuetify.theme.currentTheme.secondary}'
      )
        tbody
          template(v-for='(v, k) in exportInfo')
            tr(v-if='!!v' :key='k')
              td {{ k }}
              td.text-end
                copy-pill(
                  color='accent'
                  text-color='warning'
                  :text='v'
                ).mr-3
</template>
<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { NodeExportStatus, NodeExport } from '~/types/apiResponse'

export default defineComponent({
  props: {
    exportData: {
      required: true,
      type: Object as () => NodeExport
    }
  },
  components: {
    CopyPill: () => import('~/components/core/CopyPill.vue')
  },
  setup ({ exportData }) {
    const isPending = computed(() => exportData.status === NodeExportStatus.pending)

    const exportInfo = computed(() => ({
      Type: exportData.type,
      "Node ID": exportData.node_id,
      "Export ID": exportData.export_id,
      "Expire Date": exportData.expires
    }))

    return {
      isPending,
      exportInfo
    }
  }
})
</script>