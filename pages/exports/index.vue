<template lang="pug">
  v-container
    v-row(justify='center')
      v-col(cols='12')
        v-fade-transition(group)
          node-export(:exportData='exportData' v-for='(exportData, i) in filteredExports' :key='exportData.export_id')

</template>
<script lang="ts">
import { defineComponent, SetupContext, computed } from '@vue/composition-api'
import { exportsStore } from '~/store'

let timerID: NodeJS.Timeout

function checkStartRefresh (root: SetupContext["root"]) {
  if (exportsStore.shouldRefresh) {
    // make suer interval is clean
    clearInterval(timerID)

    //set new interval
    timerID = setInterval(() => {
      root.$fetch()
      // fetch no longer required
      if (!exportsStore.shouldRefresh) {
        clearInterval(timerID)
      }
    }, 5000)
  }
}

export default defineComponent({
  components: {
    NodeExport: () => import('~/components/NodeExport.vue')
  },
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  async fetch () {
    // @ts-ignore
    const axios = this.$nuxt.context.$axios
    // @ts-ignore
    const res = await axios.get('/export')
    exportsStore.EXPORTS(res.data.exports)
    // @ts-ignore
    checkStartRefresh(this.$nuxt.context)
  },
  setup (_, { root }) {

    checkStartRefresh(root)

    const filteredExports = computed(() => {
      return exportsStore.exports.filter((exp) => {
        const query = root.$route.query.filter
        if (query) {
          return query.includes(exp.export_id)
        }
        return true
      })
    })

    return {
      filteredExports
    }
  }
})
</script>