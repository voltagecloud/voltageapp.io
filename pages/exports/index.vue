<template lang="pug">
  v-container
    v-row(
      v-if='!loading && !filteredExports.length'
      justify='center'
      align='center'
      style='height: 100%;'
    )
      v-col(col='12').text-center
        v-card
          v-card-text.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
            | You have no exports
    v-row(v-else justify='center')
      v-col(cols='12')
        v-fade-transition(group)
          v-col(cols='12' v-for='(exportData, i) in filteredExports' :key='exportData.export_id')
            node-export(:exportID='exportData.export_id')
</template>
<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import { exportsStore } from '~/store'

let timerID: NodeJS.Timeout

export default defineComponent({
  components: {
    NodeExport: () => import('~/components/NodeExport.vue')
  },
  async fetch () {
    // @ts-ignore
    this.loading = true
    // @ts-ignore
    const axios = this.$nuxt.context.$axios
    // @ts-ignore
    const res = await axios.get('/export')
    exportsStore.EXPORTS(res.data.exports)
    // @ts-ignore
    this.loading = false
    if (exportsStore.shouldRefresh && !timerID) {
      // make suer interval is clean
      // set new interval
      const timerID = setInterval(async () => {
        // If the user leaves the page stop checking
        // @ts-ignore
        if (this.$route.name !== 'exports') {
          clearInterval(timerID)
        }
        const res = await axios.get('/export')
        exportsStore.EXPORTS(res.data.exports)
        if (!exportsStore.shouldRefresh) {
          clearInterval(timerID)
        }
      }, 5000)
    }
  },
  setup (_, { root }) {
    const loading = ref(false)

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
      filteredExports,
      loading
    }
  }
})
</script>
