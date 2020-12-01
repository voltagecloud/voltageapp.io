<template lang="pug">
  v-container
    v-container(v-if='showTrialBox' color='primary')
      v-dialog(max-width='800' color='secondary' :value='showTrialBox' @click:outside='clear')
        v-card.text-center(style='padding: 20px;' color='info')
          v-card-title Welcome to Voltage!
          v-container
            v-row(justify='center')
              v-col(cols='12')
                p(style='font-size: 24px;')
                  | Create a Node
                p(style='padding-left: 5px; padding-right: 5px; font-size: 15px;')
                  | Create your free trial node now. These trial nodes last for 7 days and are provisioned on Bitcoin's testnet.
                v-form(ref='form' v-model='valid' lazy-validation @submit.prevent='populate')
                  v-col(cols='12' style='max-width: 100%;')
                      v-card-title.font-weight-light.warning--text.text--darken-1.v-card--title
                        | Choose Name
                      div(style='padding-left: 5px; padding-right: 5px;')
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
                    div(style='padding: 5px;')
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

    v-row(justify='center' align='center' no-gutters)
      v-col(cols='12' lg='10' xl='8' v-if='!noNodes')
        v-fade-transition(group)
          template(v-if='display && nodes.length')
            div(v-for='(node, i) in nodes' :key='node.node_id')
              v-col(cols='12').px-0
                node-controls(:nodeID='node.node_id')
      v-col(cols='12' sm='6' v-else-if='noNodes')
        v-card(color='info' key='no-nodes')
          v-card-text.text-center
            | You dont have any nodes yet.
            br
            | Nodes you create will appear here.
          v-card-actions
            v-btn(to='/create' color='secondary').warning--text.px-6.mx-auto Create Node

</template>
<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import { layoutStore, nodeStore } from '~/store'
import useFormValidation from '~/compositions/useFormValidation'
import useNodeApi from '~/compositions/useNodeApi'
import { createStore } from '~/store'

export default defineComponent({
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  components: {
    AvailableNode: () => import('~/components/AvailableNode.vue'),
    NodeControls: () => import('~/components/viewnode/NodeControls.vue')
  },
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

    const nodeName = computed({
      get: () => createStore.nodeName,
      set: (v: string) => createStore.NODE_NAME(v)
    })

    const errorMessage = ref('')
    const error = ref('')

    layoutStore.SET_TITLE('Dashboard')
    layoutStore.DRAWER(null)

    const nodes = computed(() => nodeStore.IDNames)

    const display = computed(() => !!nodeStore.user)

    const noNodes = computed(() => nodes.value.length === 0 && display.value)

    const showTrialBox = computed(() => nodeStore.showTrialBox)

    /*
    TODO:
    The showTrialBox gets reset on refresh. Need to persist it. 
    If showTrialBox is true, then we need to call the /node/create endpoint and create a node
    */

    if (showTrialBox.value) {
      console.log("I'll show it")
    }

    async function clear() {
      nodeStore.SET_SHOWED_TRIAL(true)
    }

    async function populate() {
      if (nodeName.value == "") {
        errorMessage.value = "You must specify a node name."
        return
      }
      if (password.value == "") {
        error.value = "You must create a password."
        return
      }
      settings.alias = nodeName.value
      settings.color = "#EF820D"
      settings.whitelist = settings.whitelist
      settings.webhook = ''
      settings.autopilot = false
      settings.grpc = true
      settings.rest = true
      settings.keysend = true
      settings.wumbo = true
      createStore.SETTINGS(settings)
      createStore.PASSWORD(password.value)
      try {
        const res = await populateNode()
        nodeStore.SET_SHOWED_TRIAL(true)
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

    return {
      nodes,
      display,
      noNodes,
      showTrialBox,
      validateName,
      populate,
      error,
      errorMessage,
      populateError,
      required,
      password,
      valid,
      loading,
      confirmPassword,
      showPassword,
      matchPassword,
      char8,
      nodeName,
      clear
    }
  }
})
</script>
