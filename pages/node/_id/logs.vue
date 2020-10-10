<template lang="pug">
  v-container
    v-row
      v-card(color='info')
        v-card-title.font-weight-light.warning--text.text--darken-1.v-card__title Logs for Node ID: {{ node_id }}
        v-card-text
          v-list(color='secondary')
            v-list-item(v-for='(log, i) in log_lines')
              v-list-item-content
                v-list-item-title.warning--text {{ log }}
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs } from '@vue/composition-api'

export default defineComponent({
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  setup (_, { root }) {
    const state = reactive({
      last_modified: '',
      log_lines: [],
      node_id: ''
    })

    async function getLogs (node_id: string) {
      const res = await root.$nuxt.context.$axios({
        method: 'POST',
        url: '/node/logs',
        data: { node_id }
      })
      state.last_modified = res.data.last_modified
      state.log_lines = res.data.log_lines
      state.node_id = res.data.node_id
    }

    getLogs(root.$route.params.id)

    return {
      ...toRefs(state)
    }
  }
})
</script>
