<template lang="pug">
  v-card(color='secondary')
    v-card-title Choose Export Type
    v-card-actions
      v-container
        v-row(justify='center' no-gutters)
          v-col(cols='12')
            v-select(
              v-model='chosenExport'
              :items='exportTypes'
              :error-messages='errorMessage'
              placeholder='Export Type'
              outlined
            )
          v-col(cols='12')
            v-btn(color='info' @click='handleExport' block).warning--text Start Export
</template>
<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import { ExportData } from '~/types/api'
import useNodeApi from '~/compositions/useNodeApi'

export default defineComponent({
  props: {
    nodeID: {
      type: String,
      required: true
    },
    nodeStatus: {
      type: String,
      required: true
    }
  },
  setup (props, { root }) {
    const chosenExport = ref(ExportData.full)
    const exportTypes = Object.values(ExportData)
    const errorMessage = ref('')
    const { startExport, loading } = useNodeApi(root.$nuxt.context)

    async function handleExport () {
      if (props.nodeStatus !== 'stopped' && chosenExport.value === 'full') {
        errorMessage.value = 'Node must be stopped for a full export'
      } else {
        errorMessage.value = ''
        const res = await startExport(props.nodeID, chosenExport.value)
        root.$router.push(`/exports?filter=${res.data.export_id}`)
      }
    }

    return {
      errorMessage,
      chosenExport,
      loading,
      handleExport,
      exportTypes
    }
  }
})
</script>
