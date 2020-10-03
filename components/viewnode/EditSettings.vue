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
          //- v-col(cols='12' sm='4' md='6' ref='colWidth' align-self='stretch')
          v-col(cols='12' md='10').px-10.py-0
            v-row(justify='space-between')
              v-tooltip(top :open-on-click="true" :open-on-hover="true")
                template(v-slot:activator="{ on }")
                  v-switch(v-model='settings.autopilot' v-on="on" label='Autopilot' inset color='highlight')
                span
                  | Autopilot automatically manages channels for you
              v-tooltip(top :open-on-click="true" :open-on-hover="true")
                template(v-slot:activator="{ on }")
                  v-switch(v-model='settings.grpc' v-on="on" label='gRPC' inset color='highlight')
                span
                  | Enable the gRPC API in LND
              v-tooltip(top :open-on-click="true" :open-on-hover="true")
                template(v-slot:activator="{ on }")
                  v-switch(v-model='settings.rest' v-on="on" label='REST' inset color='highlight')
                span
                  | Enable the REST API in LND
              //- v-tooltip(top v-model="show" :open-on-click="true" :open-on-hover="true")
              //-   template(v-slot:activator="{ on }")
              //-     v-switch(v-model='settings.tor' label='Tor' inset color='highlight')
              //-   span
              //-     | Enable the Tor for LND APIs
              v-tooltip(top :open-on-click="true" :open-on-hover="true")
                template(v-slot:activator="{ on }")
                  v-switch(v-model='settings.keysend' v-on="on" label='Keysend' inset color='highlight')
                span
                  | Keysend allows for accepting payments without generating an invoice
              v-tooltip(top :open-on-click="true" :open-on-hover="true")
                template(v-slot:activator="{ on }")
                  v-switch(v-model='settings.wumbo' v-on="on" label='Wumbo' inset color='highlight')
                span
                  | Allows LND to create channels larger than 0.1677 BTC
              //- v-switch(v-model='backupMacaroon' label='Backup Macaroons' inset color='highlight')
          v-col(cols='12')
            v-row(justify='center')
              v-col(cols='12' ref='colWidth')
                v-btn(block @click='showPalette = !showPalette' :color='settings.color' :style='{color: oppositeColor}') Color: {{settings.color}}
              v-expand-transition
                v-col(cols='12' v-if='showPalette').justify-center.align-center.text-center
                  v-color-picker(
                    v-model='settings.color'
                    mode='hexa'
                    hide-mode-switch
                    hide-canvas
                    show-swatches
                    hide-inputs
                    flat
                    :width="colWidth.clientWidth"
                  )
          v-col(cols='12').pb-0
            v-text-field(
              v-model='settings.alias'
              outlined label='Node Alias'
              color='highlight'
              background-color='secondary'
            )
          v-col(cols='12').pb-01
            v-combobox(v-model='settings.whitelist' chips='' label='IP Whitelist' multiple='' outlined='' color='highlight' background-color='secondary' :rules='[validIP]')
              template(v-slot:selection='{ attrs, item, select, selected }')
                v-chip(v-bind='attrs' :input-value='selected' close='' @click='select' @click:close='remove(settings, item)')
                  | {{ item }}
          v-col(cols='12' sm='4' md='6' ref='colWidth' align-self='stretch')
            v-btn.px-4.warning--text(block color='secondary' :disabled='!canUpdateTls' :loading='tlsLoading' @click='updateCert')
              | {{ tlsMessage }}
          v-col(cols='12').pt-0
            p.warning--text
              | Updating settings will restart your node.
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
  setup (props, { root, emit }) {
    const showSettings = ref(false)
    const { valid, form, invertColor, validIP, showPalette, remove } = useFormValidation()

    const settings = ref(Object.assign({}, props.node.settings || {}))
    const backupMacaroon = ref(!!props.node.macaroon_backup)

    const { updateSettings, updateTls, loading } = useNodeApi(root.$nuxt.context)

    const tlsLoading = ref(false)

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
        emit('updated')
        await updateSettings(props.node.node_id, backupMacaroon.value, settings.value)
        showSettings.value = false
      }
    }

    const tlsMessage = computed(() => {
      if (props.node.status !== "stopped") {
        return "Stop node to update certificate"
      } else{
        return "Update TLS Certificate"
      }
    })

    const oppositeColor = computed(() => invertColor(props.node.settings.color))

    const canUpdateTls = computed(() => {
      if (props.node.status !== "stopped") {
        return false
      } else{
        return true
      }
    })

    async function updateCert () {
      tlsLoading.value = true
      await updateTls(props.node.node_id)
      // @ts-ignore
      root.$nuxt.$router.go()
    }

    return {
      form,
      valid,
      validIP,
      showSettings,
      settings,
      backupMacaroon,
      colWidth,
      computedWidth,
      confirmSettings,
      updateCert,
      loading,
      tlsMessage,
      canUpdateTls,
      remove,
      oppositeColor,
      showPalette
    }
  }
})
</script>
