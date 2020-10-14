<template lang="pug">
  v-container
    v-row
      v-card(color='info')
        v-card-title.font-weight-light.warning--text.text--darken-1.v-card__title Logs for '{{ node_name }}'
        p.font-weight-light.warning--text.text--darken-1(style='padding-left: 20px;')
          | Last Modified: {{ last_modified }}
        v-card-text
          v-list(style='background-color: #505050; font-family: monospace; border-radius: 5px;').scrollable
            v-list-item(v-for='(log, i) in log_lines')
              v-list-item-content
                v-list-item-title(style='font-size: 12px; color: #ffffff;') {{ log }}
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs } from '@vue/composition-api'

export default defineComponent({
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  setup (_, { root }) {
    const state = reactive({
      last_modified: 'loading',
      log_lines: ['loading'],
      node_id: '',
      node_name: 'loading'
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
      state.node_name = res.data.node_name
    }

    getLogs(root.$route.params.id)

    return {
      ...toRefs(state)
    }
  }
})
</script>
<style lang="scss">
.v-list.scrollable {
  overflow-x: scroll;

  .v-list-item__content {
    overflow: inherit;
  }
}
</style>