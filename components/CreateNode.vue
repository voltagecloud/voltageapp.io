<template lang="pug">
  v-card(color='info')
    v-card-title.font-weight-light.warning--text.text--darken-1
      | Creating {{ displayNetwork }} Node {{ isTrial }}
    v-form(ref='form' v-model='valid' lazy-validation @submit.prevent='populate')
      div(justify='center' align='center' style='margin: auto;')
        v-card-title.font-weight-light.warning--text.text--darken-1.v-card--title
          | Choose Configuration
      div(justify='center' align='center' style='margin: auto;')
        v-row(justify='center' style='max-width: 75%;')
          v-col(cols='12' lg='4')
            v-btn(fab icon tile raised elevation="12" value='Personal Node' @click='tileSelect' :style='((chosenConfig == "Personal Node") ? "border: solid; border-color: #1d437b; background: #ffffff;" : "background: #e4e4e4;") + " border-radius: 5px;  width: 175px; height: 75px;"')
              | Personal Node
          v-col(cols='12' lg='4')
            v-btn(fab icon tile raised elevation="12" value='Routing Node' @click='tileSelect' :style='((chosenConfig == "Routing Node") ? "border: solid; border-color: #1d437b; background: #ffffff;" : "background: #e4e4e4;") + " border-radius: 5px;  width: 175px; height: 75px;"')
              | Routing Node
          v-col(cols='12' lg='4')
            v-btn(fab icon tile raised elevation="12" value='Ecommerce Node' @click='tileSelect' :style='((chosenConfig == "Ecommerce Node") ? "border: solid; border-color: #1d437b; background: #ffffff;" : "background: #e4e4e4;") + " border-radius: 5px;  width: 175px; height: 75px;"')
              | Ecommerce Node
          v-col(cols='12' lg='4')
            v-btn(fab icon tile raised elevation="12" value='Development Node' @click='tileSelect' :style='((chosenConfig == "Development Node") ? "border: solid; border-color: #1d437b; background: #ffffff;" : "background: #e4e4e4;") + " border-radius: 5px;  width: 175px; height: 75px;"')
              | Development Node
          v-col(cols='12' lg='4')
            v-btn(fab icon tile raised elevation="12" value='Research Node' @click='tileSelect' :style='((chosenConfig == "Research Node") ? "border: solid; border-color: #1d437b; background: #ffffff;" : "background: #e4e4e4;") + " border-radius: 5px;  width: 175px; height: 75px;"')
              | Research Node
          v-col(cols='12' lg='4')
            v-btn(fab icon tile raised elevation="12" value='Advanced Configuration' @click='tileSelect' :style='((chosenConfig == "Advanced Configuration") ? "border: solid; border-color: #1d437b; background: #ffffff;" : "background: #e4e4e4;") + " border-radius: 5px;  width: 175px; height: 75px;"')
              | Advanced

      v-container(v-if='advancedSettings')
        v-row(justify='center')
          v-col(cols='12').py-0
            p(style="padding-left: 5px;").warning--text.text--darken-1
              | Advanced Settings
              br
          v-col(cols='12').py-0
            a(style="padding-left: 5px;").font-weight-light.warning--text.text--darken-1
              | Node Alias is a Lightning node setting and is broadcasted to the network.
            v-text-field(v-model='settings.alias' label='Node Alias' outlined color='highlight' background-color='secondary')
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
              //- v-tooltip(top :open-on-click="true" :open-on-hover="true")
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
            p(style="padding-left: 5px;").font-weight-light.warning--text.text--darken-1
              | IP Whitelist restricts access to your node's API based on IP address. (Prefilled with your current IP address)
            v-combobox(v-model='settings.whitelist' chips='' label='IP Whitelist' multiple='' outlined='' color='highlight' background-color='secondary' :rules='[validIP]')
              template(v-slot:selection='{ attrs, item, select, selected }')
                v-chip(v-bind='attrs' :input-value='selected' close='' @click='select' @click:close='remove(settings, item)')
                  | {{ item }}
          v-divider.mx-12.mt-6

      v-col(cols='12' style='max-width: 100%;')
          v-card-title.font-weight-light.warning--text.text--darken-1.v-card--title
            | Choose Name
          div(justify='center' align='center' style='margin: auto;')
            p.warning--text.text--darken-1
              | Give your node a name. This will be part of your API endpoint and can't be changed.
          div(style='padding-left: 20px; padding-right: 20px;')
            v-text-field(
              v-model='nodeName'
              label='Node Name'
              outlined
              color='highlight'
              background-color='secondary'
              :error-messages='errorMessage'
              :rules='[required]'
              @blur='validateName'
              required
            )
      v-col(cols='12' style='max-width: 100%;')
        v-card-title.font-weight-light.warning--text.text--darken-1.v-card--title
          | Choose Password
        div(justify='center' align='center' style='margin: auto;')
          p(style="padding-left: 5px;").warning--text.text--darken-1
            | Create a password for your node
        div(style='padding: 20px;')
          v-form(v-model='valid' ref='form')
            v-text-field(
              v-model='password'
              :rules='[required]'
              label='Password'
              color='highlight'
              background-color='secondary'
              outlined
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showPassword ? 'text' : 'password'"
              required
              @click:append='showPassword = !showPassword'
            )
            v-text-field(
              v-model='confirmPassword'
              :rules='[char8, matchPassword, required]'
              :type="showPassword ? 'text' : 'password'"
              label='Confirm Password'
              color='highlight'
              background-color='secondary'
              outlined
              :error-messages='error'
              required
            )
            div.text-center.warning--text.mb-6
              v-icon(style='padding-bottom: 10px;') mdi-alert-circle
              br
              | Write this password down! You need it to unlock your node. Also your node's seed and macaroons are encrypted to this password. Losing this password means losing access to backups and Voltage can not reset it.
            v-divider.mx-12.mt-6

      div(justify='center' align='center' style='margin: auto;')
        v-row(justify='center' style='max-width: 75%;')
          v-col(cols='12').pt-0
            p.px-4.error--text(v-if='populateError')
              | There was a problem configuring the node. Please retry or create a new one.
          v-col(cols='12').pt-0
            v-btn.px-4.warning--text(block='' type='submit' color='secondary' large='' :loading='loading' :disabled='!valid')
              | Provision Node
              br
            div.text-center.warning--text.mb-6(style='padding-top: 15px;')
              | Please do not close your browser until your node is running.
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
      invertColor,
      char8,
      matchPassword,
      confirmPassword,
      password,
      showPassword
    } = useFormValidation()
    const { populateNode, loading, nodeName: checkNodeName } = useNodeApi(root.$nuxt.context)

    const oppositeColor = computed(() => invertColor(settings.color))
    const populateError = ref(false)
    const error = ref('')
    const configErrorMessage = ref('')
    const advancedSettings = ref(false)
    const chosenConfig = ref('Personal Node')

    function tileSelect (event: any) {
      chosenConfig.value = event.currentTarget.getAttribute('value')
      if (chosenConfig.value == "Advanced Configuration") {
        advancedSettings.value = true
        configErrorMessage.value = ""
      } else {
        advancedSettings.value = false
        configErrorMessage.value = ""
      }
    }

    const nodeName = computed({
      get: () => createStore.nodeName,
      set: (v: string) => createStore.NODE_NAME(v)
    })

    const errorMessage = ref('')

    async function populate() {
      if (nodeName.value == "") {
        errorMessage.value = "You must specify a node name."
        return
      }
      if (chosenConfig.value == "") {
        configErrorMessage.value = "You must select a configuration type."
        return
      }
      if (password.value == "") {
        error.value = "You must create a password."
        return
      }
      if (chosenConfig.value !== "Advanced Configuration") {
        settings.alias = nodeName.value
        settings.color = "#EF820D"
        settings.whitelist = settings.whitelist
        switch(chosenConfig.value) {
          case "Personal Node":
            settings.autopilot = false
            settings.grpc = true
            settings.rest = true
            settings.keysend = true
            settings.wumbo = false
            break;
          case "Routing Node":
            settings.autopilot = false
            settings.grpc = true
            settings.rest = false
            settings.keysend = false
            settings.wumbo = true
            break;
          case "Ecommerce Node":
            settings.autopilot = false
            settings.grpc = false
            settings.rest = true
            settings.keysend = false
            settings.wumbo = true
            break;
          case "Development Node":
            settings.autopilot = (createStore.network == "testnet") ? true : false
            settings.grpc = true
            settings.rest = true
            settings.keysend = true
            settings.wumbo = false
            break;
          case "Research Node":
            settings.autopilot = (createStore.network == "testnet") ? true : false
            settings.grpc = true
            settings.rest = true
            settings.keysend = true
            settings.wumbo = true
            break;
          default:
            break;
        }
      }
      createStore.SETTINGS(settings)
      createStore.PASSWORD(password.value)
      try {
        const res = await populateNode()
        root.$router.push(`/node/${createStore.newNodeID}`)
      } catch (e) {
        console.log(e)
        populateError.value = true
      }
    }

    async function validateName () {
      if (!nodeName.value) { return }
      const res = await checkNodeName(nodeName.value, createStore.network)
      if (res.data.taken) {
        errorMessage.value = 'Node name is already taken'
      } else if (!res.data.valid) {
        errorMessage.value = 'Invalid node name. Must be only letters, numbers, and dashes with less than 42 characters.'
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
      tileSelect,
      valid,
      settings,
      required,
      nodeName,
      form,
      loading,
      populateError,
      remove,
      displayNetwork,
      isTrial,
      validIP,
      char8,
      matchPassword,
      showPalette,
      oppositeColor,
      colWidth,
      errorMessage,
      validateName,
      advancedSettings,
      chosenConfig,
      confirmPassword,
      password,
      showPassword,
      error,
      configErrorMessage,
      populate
    }
  }
})
</script>
