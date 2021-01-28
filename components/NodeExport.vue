<template lang="pug">
  v-card(color='info')
    v-progress-linear(indeterminate absolute top v-if='isPending')
    v-card-title
      v-row(align='center' justify='space-between' no-gutters)
        v-col(cols='auto')
          v-row(no-gutters)
            v-col(cols='12').font-weight-light.warning--text.text--darken-1.v-card__title
              span {{ exportData.name }}
              span.caption.warning--text.ml-2 {{ exportData.status }}
            //- v-col(cols='12').overline
            //-   | {{ nodeData.purchased_type=='trial' ? 'Testnet (trial)' : nodeData.network }}
        v-col(cols='auto')
          v-row(justify='end')

            v-tooltip(top :open-on-click="true" :open-on-hover="true")
              template(v-slot:activator="{ on }")
                v-btn(icon v-bind="$attrs" v-on="on" :to='`/node/${exportData.node_id}`').mx-1
                  v-icon mdi-forward
              span
                | Go to Node
            v-tooltip(top :open-on-click="true" :open-on-hover="true")
              template(v-slot:activator="{ on }")
                v-btn(icon v-bind="$attrs" v-on="on" :href='exportData.url' target='_blank' :disabled='isPending').ml-1.mr-3
                  v-icon mdi-download
              span
                | Download Export
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
import { exportsStore } from '../store'
import { NodeExportStatus } from '~/types/apiResponse'

export default defineComponent({
  props: {
    exportID: {
      required: true,
      type: String
    }
  },
  components: {
    CopyPill: () => import('~/components/core/CopyPill.vue')
  },
  setup ({ exportID }) {
    const exportData = computed(() => exportsStore.exports.filter(elem => elem.export_id === exportID)[0])
    const isPending = computed(() => exportData.value.status === NodeExportStatus.pending)

    const exportInfo = computed(() => ({
      Type: exportData.value.type,
      'Node ID': exportData.value.node_id,
      'Export ID': exportData.value.export_id,
      'Expire Date': exportData.value.expires
    }))

    return {
      isPending,
      exportInfo,
      exportData
    }
  }
})
</script>
