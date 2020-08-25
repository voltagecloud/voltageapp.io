<template lang="pug">
  v-card(color='info')
    v-card-title.font-weight-light.warning--text.text--darken-1
      | Creating {{ displayNetwork }} Node {{ isTrial }}
    v-form(ref='form' v-model='valid' lazy-validation='' @submit.prevent='handlePopulate')
      v-container
        v-row(justify='center')
          v-col(cols='12').pb-0
            v-text-field(
              v-model='nodeName'
              label='Node Name'
              outlined
              color='highlight'
              background-color='secondary'
              :error-messages='errorMessage'
              :rules='[required]'
              @blur='validateName'
            )
          v-col(cols='12').py-0
            v-text-field(v-model='settings.alias' label='Node Alias' outlined color='highlight' background-color='secondary')
          v-col(cols='12' md='10').px-10.py-0
            v-row(justify='space-between')
              v-tooltip(top v-model="show" :open-on-click="true" :open-on-hover="true")
                template(v-slot:activator="{ on }")
                  v-switch(v-model='settings.autopilot' v-on="on" label='Autopilot' inset color='highlight')
                v-span
                  | Autopilot automatically manages channels for you
              v-tooltip(top v-model="show" :open-on-click="true" :open-on-hover="true")
                template(v-slot:activator="{ on }")
                  v-switch(v-model='settings.grpc' v-on="on" label='gRPC' inset color='highlight')
                v-span
                  | Enable the gRPC API in LND
              v-tooltip(top v-model="show" :open-on-click="true" :open-on-hover="true")
                template(v-slot:activator="{ on }")
                  v-switch(v-model='settings.rest' v-on="on" label='REST' inset color='highlight')
                v-span
                  | Enable the REST API in LND
              //- v-tooltip(top v-model="show" :open-on-click="true" :open-on-hover="true")
              //-   template(v-slot:activator="{ on }")
              //-     v-switch(v-model='settings.tor' label='Tor' inset color='highlight')
              //-   v-span
              //-     | Enable the Tor for LND APIs
              v-tooltip(top v-model="show" :open-on-click="true" :open-on-hover="true")
                template(v-slot:activator="{ on }")
                  v-switch(v-model='settings.keysend' v-on="on" label='Keysend' inset color='highlight')
                v-span
                  | Keysend allows for accepting payments without generating an invoice
              v-tooltip(top v-model="show" :open-on-click="true" :open-on-hover="true")
                template(v-slot:activator="{ on }")
                  v-switch(v-model='settings.wumbo' v-on="on" label='Wumbo' inset color='highlight')
                v-span
                  | Allows LND to create channels larger than 0.1677 BTC
              //- v-switch(v-model='backupMacaroon' label='Backup Macaroons' inset color='highlight')
          v-col(cols='12')
            v-row(justify='center')
              v-col(cols='12' ref='colWidth')
                v-btn(block @click='showPalette = !showPalette' :color='settings.color' :style='{color: oppositeColor}') Color: {{settings.color}}
              v-expand-transition
                v-col(cols='12' v-if='showPalette')
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
          v-col(cols='12').pb-0.pt-1
            v-combobox(v-model='settings.whitelist' chips='' label='Whitelist' multiple='' outlined='' color='highlight' background-color='secondary' :rules='[validIP]')
              template(v-slot:selection='{ attrs, item, select, selected }')
                v-chip(v-bind='attrs' :input-value='selected' close='' @click='select' @click:close='remove(settings, item)')
                  | {{ item }}
          v-col(cols='12').pt-0
            v-btn.px-4.warning--text(block='' type='submit' color='secondary' large='' :loading='loading' :disabled='!valid')
              | Save Settings
</template>

<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import useFormValidation from '~/compositions/useFormValidation'
import useNodeApi from '~/compositions/useNodeApi'
import { createStore } from '~/store'

export default defineComponent({
  name: 'CreateNode',
  setup (_, { root }) {
    const {
      valid,
      settings,
      required,
      form,
      validIP,
      remove,
      showPalette,
      invertColor
    } = useFormValidation()
    const { populateNode, loading, nodeName: checkNodeName } = useNodeApi(root.$nuxt.context)

    const oppositeColor = computed(() => invertColor(settings.color))

    async function handlePopulate () {
      createStore.SETTINGS(settings)
      const res = await populateNode()
      console.log({ res })
      root.$router.push(`/node/${createStore.newNodeID}`)
    }

    const nodeName = computed({
      get: () => createStore.nodeName,
      set: (v: string) => createStore.NODE_NAME(v)
    })

    const errorMessage = ref('')

    async function validateName () {
      if (!nodeName.value) { return }
      const res = await checkNodeName(nodeName.value, createStore.network)
      if (res.data.taken) {
        errorMessage.value = 'Node name is already taken'
      } else if (!res.data.valid) {
        errorMessage.value = 'Invalid node name'
      } else {
        errorMessage.value = ''
      }
    }

    const displayNetwork = computed(() => {
      const n = createStore.network
      return n.charAt(0).toUpperCase() + n.slice(1)
    })

    const isTrial = computed(() => createStore.trial ? '(trial)' : '')
    const colWidth = ref(null)

    return {
      valid,
      settings,
      required,
      nodeName,
      form,
      loading,
      handlePopulate,
      remove,
      displayNetwork,
      isTrial,
      validIP,
      showPalette,
      oppositeColor,
      colWidth,
      errorMessage,
      validateName
    }
  }
})
</script>
