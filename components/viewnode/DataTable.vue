<template lang="pug">
v-container
  v-simple-table(
    :style='{"background-color": $vuetify.theme.currentTheme.secondary}'
  )
    tbody
      template(v-for='(v, k) in nodeInfo')
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
  setup (props) {
    const nodeInfo = computed(() => ({
      Status: props.node.status,
      'LND Version': props.node.lnd_version,
      'TLS Cert': props.node.tls_cert,
      'Creation Date': props.node.created,
      'Expiry Date': props.node.expires,
      'API Endpoint': props.node.api_endpoint
    }))

    return {
      nodeInfo
    }
  }
})
</script>