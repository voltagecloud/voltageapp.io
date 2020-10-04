<template lang="pug">
v-container
  v-row
    v-col
      v-fade-transition
        node-controls(:nodeID='nodeID' @event='$fetch')
          template(v-slot:append-content v-if='nodeData && nodeData.node_name')
            v-divider
            data-table(:node='nodeData')
            v-divider
            v-container(v-if='canInit')
              v-btn(color='highlight' block @click='initialize' :loading='initializing').info--text Initialize
            v-container.align-center.justify-center(v-if='canUnlock')
              password-dialog(
                v-model='unlockDialog'
                @done='unlockNode'
                useActivator
                activatorText='Unlock'
                text='Unlock Node'
                :error='error'
                :loading='unlocking'
              )
            v-container(v-if='canUpdate' @click='confirmUpdate = true')
              v-btn(color='highlight' block).info--text Update Available
            v-container(v-if='canUpdate' @click='confirmUpdate = true')
              v-dialog(v-model='confirmUpdate' max-width='800')
                v-card
                  v-card-text.pt-3.font-weight-light.warning--text.text--darken-1
                    | Updating requires a restart of your node. Are you sure you want update this node?
                  v-card-actions
                    v-btn(color='info' @click='closeAndUpdate') Yes
                    v-btn(@click='confirmUpdate = false') No
            v-container(v-if='status === "running"')
              v-btn(color='highlight' block @click='connect').info--text Connect
            password-dialog(v-model='showPasswordDialog' @done='handleConnectNode' :error='error' text='Connect to Node')
            v-container(v-if='showQrDialog === true')
              show-qr(v-model='showQrDialog' :connectURI='connectURI' :api='apiEndpoint' :cert='cert' :macaroon='macaroon' :pass='pass' :grpc='grpc' :rest='rest' @clear='clearQr' @updateApi='buildUri')
            edit-settings(:node='nodeData' @updated='$fetch')
            v-container
              v-dialog(max-width='800')
                template(v-slot:activator='{ on }')
                  v-btn(:disabled='status === "provisioning"' v-on='on' color='secondary' block).warning--text Export Data
                export-data(:nodeID='nodeID' :nodeStatus='status')
</template>
<script lang="ts">
import { defineComponent, computed, ref, watch } from '@vue/composition-api'
import axios from 'axios'
import crypto from 'crypto-js'
import { nodeStore, lndStore } from '~/store'
import useNodeStatus from '~/compositions/useNodeStatus'
import useNodeApi from '~/compositions/useNodeApi'
import useFormValidation from '~/compositions/useFormValidation'
import { Node } from '~/types/apiResponse'

export default defineComponent({
  components: {
    NodeControls: () => import('~/components/viewnode/NodeControls.vue'),
    DataTable: () => import('~/components/viewnode/DataTable.vue'),
    EditSettings: () => import('~/components/viewnode/EditSettings.vue'),
    ExportData: () => import('~/components/ExportData.vue'),
    PasswordDialog: () => import('~/components/PasswordDialog.vue'),
    ShowQr: () => import('~/components/ShowQr.vue'),
    CopyPill: () => import('~/components/core/CopyPill.vue'),
    QrcodeVue: () => import('qrcode.vue')
  },
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  fetch () {
    // @ts-ignore
    const { postNode } = useNodeApi(this.$nuxt.context)
    // @ts-ignore
    postNode(this.nodeID)
    // Logic for auto-refreshing
    // make sure interval is clean
    // set new interval
    let firstRun = true
    // @ts-ignore
    this.timer = setInterval(async () => {
      // @ts-ignore
      let previousStatus = this.status
      if (!firstRun) {
        // If the node was running, deleted, or stopped on load don't try to refresh
        if (previousStatus === 'running' || previousStatus === 'stopped' || previousStatus === 'deleted') {
          // @ts-ignore
          clearInterval(this.timer)
          return
        }
      }
      // @ts-ignore
      const { postNode } = useNodeApi(this.$nuxt.context)
      // @ts-ignore
      const res = await postNode(this.nodeID)
      // @ts-ignore
      const shouldRefresh = previousStatus === res.status
      // @ts-ignore
      previousStatus = res.status
      // If the user leaves the node's page stop checking
      // @ts-ignore
      if (this.$route.params.id !== res.node_id) {
        // @ts-ignore
        clearInterval(this.timer)
        return
      }
      if (!shouldRefresh) {
        // If the node is in a running, deleted, or stopped state we want to stop checking
        if (previousStatus === 'running' || previousStatus === 'stopped' || previousStatus === 'deleted') {
          // @ts-ignore
          clearInterval(this.timer)
        }
      }
      firstRun = false
    }, 5000)
  },
  setup (_, { root }) {
    const nodeID = ref(root.$nuxt.context.params.id)
    const nodeData = computed(() => nodeStore.nodes.filter(elem => elem.node_id === nodeID.value)[0])
    const { canInit, canUnlock, canUpdate, status } = useNodeStatus(nodeData)
    const { updateNode, updateStatus, postNode, connectNode } = useNodeApi(root.$nuxt.context)
    const timer = ref<NodeJS.Timeout|null>(null)

    const initializing = ref(false)
    async function initialize () {
      lndStore.CURRENT_NODE(nodeData.value)
      initializing.value = true
      const node = lndStore.currentNode as Node
      try {
        const seed = await axios({
          url: `https://${node.api_endpoint}:8080/v1/genseed`,
          method: 'GET'
        })
        initializing.value = false
        lndStore.SEED(seed.data)
        root.$router.push('/confirm')
      } catch (err) {
        console.log(err)
        initializing.value = false
      } finally {
        initializing.value = false
      }
    }

    const { char8, valid, form, password: nodePassword } = useFormValidation()

    const unlockDialog = ref(false)
    const unlocking = ref(false)
    const error = ref('')
    async function unlockNode (password: string) {
      lndStore.CURRENT_NODE(nodeData.value)
      unlocking.value = true
      try {
        const node = lndStore.currentNode as Node
        await axios({
          url: `https://${node.api_endpoint}:8080/v1/unlockwallet`,
          method: 'POST',
          data: {
            wallet_password: btoa(password),
            stateless_init: true
          },
          timeout: 45000
        })
        await updateStatus(nodeData.value.node_id, 'unlocking')
        postNode(nodeID.value)
        unlockDialog.value = false
      } catch (err) {
        error.value = `${err}`
      } finally {
        unlocking.value = false
      }
    }

    async function update () {
      await updateNode(nodeData.value.node_id)
      // @ts-ignore
      root.$nuxt.$router.go()
    }

    const encrypted = ref('')
    const pass = ref('')
    const cert = ref('')
    const apiEndpoint = ref('')
    const macaroon = ref('')
    const grpc = computed(() => nodeData.value.settings.grpc)
    const rest = computed(() => nodeData.value.settings.rest)
    const showPasswordDialog = ref(false)
    const showQrDialog = ref(false)
    async function connect () {
      showPasswordDialog.value = true
      try {
        const res = await connectNode(nodeData.value.node_id, 'admin')
        const { endpoint, macaroon, tls_cert } = res
        if (macaroon) {
          apiEndpoint.value = endpoint
          cert.value = tls_cert
          encrypted.value = macaroon
        } else {
          // IMPLEMENT MACAROON UPLOAD
        }
      } catch (e) {
        error.value = e.toString()
      }
    }

    // @ts-ignore
    function isBase64 (str) {
      if (str === '' || str.trim() === '') { return false }
      try {
        return btoa(atob(str)) === str
      } catch (err) {
        return false
      }
    }
    const connectURI = ref('')

    // convert b64 to b64url
    function safeUrl (data: string) {
      data = data.replace(/\+/g, "-")
      data = data.replace(/\//g, "_")
      data = data.replace(/=/g, "")
      return data
    }

    function buildUri (api: string, port: string, tls_cert: string, macaroon: string) {
      macaroon = safeUrl(macaroon)
      connectURI.value = (tls_cert)
        ? `lndconnect://${api}:${port}?cert=${tls_cert}&macaroon=${macaroon}`
        : `lndconnect://${api}:${port}?macaroon=${macaroon}`
    }

    function handleConnectNode (password: string, api: string) {
      const port = (api === 'rest') ? '8080' : '10009'
      try {
        const decrypted = crypto.AES.decrypt(encrypted.value || '', password).toString(crypto.enc.Base64)
        const decryptResult = atob(decrypted)
        if (isBase64(decryptResult)) {
          macaroon.value = decryptResult
          buildUri(nodeData.value.api_endpoint, port, '', decryptResult)
          showQrDialog.value = true
          showPasswordDialog.value = false
          pass.value = password
        } else {
          error.value = 'Incorrect password'
        }
      } catch (e) {
        console.error('cipher mismatch, macaroon decryption failed')
        console.error(e)
        error.value = e.toString()
      }
    }

    function clearQr () {
      showQrDialog.value = false
    }

    // clear errors on typing in password field
    watch(nodePassword, () => { error.value = '' })

    const confirmUpdate = ref(false)
    async function closeAndUpdate () {
      confirmUpdate.value = false
      await update()
    }

    return {
      nodeData,
      nodeID,
      status,
      canInit,
      canUnlock,
      canUpdate,
      initialize,
      update,
      initializing,
      unlocking,
      unlockNode,
      char8,
      valid,
      form,
      nodePassword,
      unlockDialog,
      timer,
      error,
      connect,
      showPasswordDialog,
      showQrDialog,
      handleConnectNode,
      pass,
      connectURI,
      clearQr,
      encrypted,
      cert,
      apiEndpoint,
      macaroon,
      buildUri,
      confirmUpdate,
      closeAndUpdate,
      grpc,
      rest
    }
  }
})
</script>
