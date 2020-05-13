<template lang="pug">
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
      @submit.prevent='confirmSettings'
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
                v-chip(v-bind='attrs' :input-value='selected' close='' @click='select' @click:close='remove(settings, item)')
                  | {{ item }}
          v-col(cols='12').pt-0
            v-btn.px-4.warning--text(block type='submit' color='secondary' :loading='loading' :disabled='!valid')
              | Save Settings
</template>
<script lang="ts">
import { defineComponent, ref, computed } from '@vue/composition-api'
import useFormValidation from '~/compositions/useFormValidation'
import useNodeApi from '~/compositions/useNodeApi'
import { Node } from '~/types/apiResponse'

export default defineComponent({
  props: {
    node: {
      type: Object as () => Node,
      required: true
    }
  },
  setup ({node}, {root}) {
    const showSettings = ref(false)
    const { valid, form, validIP, remove } = useFormValidation()

    const settings = ref(Object.assign({}, node.settings || {}))

    const { updateSettings, loading  } = useNodeApi(root.$nuxt.context)

    const colWidth = ref<HTMLBaseElement|null>(null)
    const computedWidth = computed(() => {
      if (root.$vuetify.breakpoint.smOnly) {
        return colWidth.value ? 2 * colWidth.value.clientWidth : 0
      } else {
        return colWidth.value ? colWidth.value.clientWidth : 0
      }
    })

    async function confirmSettings () {
      if (form.value?.validate()) {
        await updateSettings(node.node_id, settings.value)
        showSettings.value = false
      }
    }


    return {
      form,
      valid,
      validIP,
      showSettings,
      settings,
      colWidth,
      computedWidth,
      confirmSettings,
      loading,
      remove
    }
  }
})
</script>