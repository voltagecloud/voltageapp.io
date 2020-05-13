<template lang="pug">
v-container
  v-simple-table(
    :style='{"background-color": $vuetify.theme.currentTheme.secondary}'
  )
    tbody
      template(v-for='(elem, i) in nodeInfo')
        tr(v-if='!!elem.data' :key='i')
          td {{ elem.dataName }}
          td.text-end
            copy-pill(
              color='accent'
              text-color='warning'
              :text='elem.data'
            ).mr-3
</template>
<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { Node } from '~/types/apiResponse'

export default defineComponent({
  props: {
    node: {
      type: Object as () => Node,
      required: true
    }
  },
  components: {
    CopyPill: () => import('~/components/core/CopyPill.vue')
  },
  setup ({node}) {
    const nodeInfo = computed(() => ([
      { dataName: 'Status', data: node.status },
      { dataName: 'Public Key', data: node.public_key },
      { dataName: 'Onion Address', data: node.onion_address },
      { dataName: 'Creation Date', data: node.creation_date },
      { dataName: 'Expiry Date', data: node.expires },
      { dataName: 'API Endpoint', data: node.api_endpoint }
    ]))

    return {
      nodeInfo
    }
  }
})
</script>