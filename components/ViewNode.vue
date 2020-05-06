<template lang="pug">
  v-fade-transition
    v-card(color='info' v-if='node')
      v-card-title.font-weight-light.warning--text.text--darken-1
        | {{ node.node_name }}
        v-row(justify='end')
          v-btn(:disabled='canStart' icon).mx-1
            v-icon mdi-play
          v-btn(:disabled='canStop' icon).mx-1
            v-icon mdi-stop
          v-btn(:disabled='canDelete' icon).ml-1.mr-3
            v-icon mdi-delete
      v-divider
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
      v-container
        v-btn(
          block
          @click='showSettings = !showSettings'
          color='secondary'
        ).warning--text {{showSettings ? 'Collapse' : 'Expand'}} Settings
      v-expand-transition
        v-form(
          v-if='showSettings'
          ref='form'
          v-model='valid'
          lazy-validation
          @submit.prevent='updateSettings(nodeID, settings)'
        )
          v-container
            v-row(justify='center')
              v-col(cols='12' sm='4' md='6' ref='colWidth' align-self='stretch')
                v-row(justify='center' align='center' style='height: 100%')
                  div
                    v-switch(v-model='settings.autopilot' label='Autopilot' inset color='highlight')
                    v-switch(v-model='settings.grpc' label='GRPC' inset color='highlight')
                    v-switch(v-model='settings.rest' label='REST' inset color='highlight')
                    v-switch(v-model='settings.tor' label='Tor' inset color='highlight')
                    v-switch(v-model='settings.keysend' label='Keysend' inset color='highlight')
              v-col(cols='12' sm='8' md='6')
                v-color-picker(
                  v-if='!!colWidth'
                  v-model='settings.color'
                  mode='hexa'
                  hide-mode-switch
                  show-swatches
                  :width='computedWidth'
                ).mx-auto
              v-col(cols='12').pb-0
                v-text-field(
                  v-model='settings.alias'
                  outlined label='Node Alias'
                  color='highlight'
                  background-color='secondary'
                )
              v-col(cols='12').pb-0
                v-combobox(v-model='settings.whitelist' chips='' label='Whitelist' multiple='' outlined='' color='highlight' background-color='secondary' :rules='[validIP]')
                  template(v-slot:selection='{ attrs, item, select, selected }')
                    v-chip(v-bind='attrs' :input-value='selected' close='' @click='select' @click:close='remove(item)')
                      | {{ item }}
              v-col(cols='12').pt-0
                v-btn.px-4.warning--text(block type='submit' color='secondary' :loading='loading' :disabled='!valid')
                  | Save Settings

          
</template>
<script lang="ts">
import { defineComponent, computed, ref, watchEffect } from '@vue/composition-api'
import useNodeApi from '~/compositions/useNodeApi'
import useNodeControls from '~/compositions/useNodeControls'
import { Context } from '@nuxt/types'
import { layoutStore, nodeStore } from '~/store'
import { Settings, NodeStatus } from '~/types/api'
import useFormValidation from '~/compositions/useFormValidation'

export default defineComponent({
  async fetch () {
    // @ts-ignore
    const ctx = this.$nuxt.context
    const { postNode } = useNodeApi(ctx)
    const nodeData = await postNode(ctx.params.id)
  },
  components: {
    CopyPill: () => import('~/components/core/CopyPill.vue')
  },
  setup (_, {root}) {
    console.log(root.$vuetify)
    const nodeID = ref(root.$nuxt.context.params.id)
    const node = computed(() => nodeStore.nodes.filter(elem => elem.node_id == nodeID.value)[0])

    const nodeInfo = computed(() => ([
      { dataName: 'Status', data: node.value?.status },
      { dataName: 'Public Key', data: node.value?.public_key },
      { dataName: 'Onion Address', data: node.value?.onion_address },
      { dataName: 'Creation Date', data: node.value?.creation_date },
      { dataName: 'Expiry Date', data: node.value?.expires },
      { dataName: 'API Endpoint', data: node.value?.api_endpoint }
    ]))

    const showSettings = ref(false)
    const settings = computed(() => Object.assign({}, node.value?.settings || {}))

    const { deleteNode, updateSettings, loading } = useNodeApi(root.$nuxt.context)
    const { canStart, canStop, canDelete} = useNodeControls(node)
    const { valid, form, validIP } = useFormValidation()

    const colWidth = ref<HTMLBaseElement|null>(null)
    const computedWidth = computed(() => {
      if (root.$vuetify.breakpoint.smOnly) {
        return colWidth.value ? 2 * colWidth.value.clientWidth : 0
      } else {
        return colWidth.value ? colWidth.value.clientWidth : 0
      }
    })

    return {
      nodeID,
      node,
      nodeInfo,
      showSettings,
      settings,
      deleteNode,
      updateSettings,
      loading,
      canStart,
      canStop,
      canDelete,
      colWidth,
      valid,
      form,
      validIP,
      computedWidth
    }
  }
})
</script>