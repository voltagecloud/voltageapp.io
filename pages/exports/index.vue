<template lang="pug">
  v-container
    v-row(justify='center')
      v-col(cols='12')
        v-fade-transition(group)
          node-export(:exportID='exportData.export_id' v-for='(exportData, i) in filteredExports' :key='exportData.export_id')

</template>
<script lang="ts">
import { defineComponent, SetupContext, computed } from '@vue/composition-api'
import { exportsStore } from '~/store'

let timerID: NodeJS.Timeout

function checkStartRefresh (root: SetupContext["root"]) {
  const anchor = root
  console.log({ anchor })
  console.log({ exportsStore })
  if (exportsStore.shouldRefresh && !timerID) {
    // make suer interval is clean
    //set new interval
    const timerID = setInterval(async () => {
      console.log({anchor})
      await anchor.$fetch()
      if (!exportsStore.shouldRefresh) {
        clearInterval(timerID)
      }
    }, 5000)
    console.log('set interval')
    console.log(timerID)
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
    console.log(this)
    // @ts-ignore
    const res = await axios.get('/export')
    exportsStore.EXPORTS(res.data.exports)
    // @ts-ignore
    checkStartRefresh(this)
  },
  setup (_, { root }) {

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