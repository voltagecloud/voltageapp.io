<template lang="pug">
v-container
  v-container(v-if='nodeExpired')
    | [BILLING ISSUE] This node is set to expire on {{ props.node.expires }} due to a past due bill.
    | Please update your payment method to prevent the node from being deleted.
    p
  //- password-dialog(v-model='showPasswordDialog' @done='handleDownload' :error='error' :text='passwordDialogButton')
  core-dialog(v-model='showPasswordDialog')
    node-password-input(:text='passwordDialogButton' :error='error' @done='handleDownload')
  v-container(v-if='downloadReady')
    v-dialog(max-width='800' :value='downloadReady' @click:outside='clear')
      v-card.text-center(style='padding: 20px;')
        v-card-actions
          v-btn(
            color='highlight'
            block
            :href='"data:application/text-plain;base64,"+macaroon'
            download='admin.macaroon'
            title='admin.macaroon'
          ).info--text
            | Download Macaroon
  v-container(v-if='certReady')
    v-dialog(max-width='800' :value='certReady' @click:outside='clearCert')
      v-card.text-center(style='padding: 20px;')
        v-card-actions
          v-btn(
            color='highlight'
            block
            :disabled='(cert === "pending")'
            :href='"data:application/text-plain;base64,"+cert'
            download='tls.cert'
            title='tls.cert'
          ).info--text
            | {{ certButtonText }}
  v-container(v-if='seedReady')
    v-dialog(max-width='800' :value='seedReady' @click:outside='clearSeed')
      v-card.text-center(style='padding: 20px;')
        v-fade-transition.justify-center.align-center.row.px-2(group appear tag='div' justify='center' :css='false' style='padding-bottom: 5%; width: 100%;')
          span.seed-word.display-3.font-weight-thin.warning--text.px-3(v-for='(word, i) in fullSeed' :key='i' :data-index='i') {{ word }}
        v-chip(color='accent' text-color='warning' @click='copySeed').align-center.justify-center
          | Click Here to Copy Seed

  v-simple-table(
    :style='{"background-color": $vuetify.theme.currentTheme.secondary}'
  )
    tbody
      template(v-for='(v, k) in nodeInfo')
        tr(v-if='!!v' :key='k')
          td {{ k }}
          td.text-end(v-if='k === "TLS Cert" && v !== "pending"')
            v-chip(
              color='accent'
              text-color='warning'
              @click='downloadCert'
            ).mr-3
              | Download
          td.text-end(v-else-if='k === "Macaroon" && props.node.macaroons.length > 0')
            v-chip(
              color='accent'
              text-color='warning'
              @click='downloadMacaroon'
            ).mr-3
              | Download
          td.text-end(v-else-if='k === "Seed" && v !== "pending"')
            v-chip(
              color='accent'
              text-color='warning'
              @click='viewSeed'
            ).mr-3
              | {{ seedButtonText }}
          td.text-end(v-else)
            copy-pill(
              color='accent'
              text-color='warning'
              :text='v'
            ).mr-3
</template>
<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
// @ts-ignore
import crypto from 'crypto-js'
import { Node } from '~/types/apiResponse'
import useNodeApi from '~/compositions/useNodeApi'
import useClipboard from '~/compositions/useClipboard'

export default defineComponent({
  props: {
    node: {
      type: Object as () => Node,
      required: true
    }
  },
  components: {
    CopyPill: () => import('~/components/core/CopyPill.vue'),
    CoreDialog: () => import('~/components/core/Dialog.vue'),
    NodePasswordInput: () => import('~/components/NodePasswordInput.vue')
  },
  setup (props, { root }) {
    const { connectNode, getCert, getSeed } = useNodeApi(root.$nuxt.context)
    const showPasswordDialog = ref(false)
    const passwordDialogButton = ref('')
    const downloadReady = ref(false)
    const certReady = ref(false)
    const certButtonText = ref('Download Certificate')
    const encrypted = ref('')
    const encryptedType = ref('')
    const macaroon = ref('')
    const cert = ref('')
    const error = ref('')
    const seed = ref('')
    const seedReady = ref(false)
    const seedButtonText = ref('View')
    const fullSeed = ref([''])

    const nodeInfo = computed(() => ({
      Status: props.node.status,
      'LND Version': props.node.lnd_version,
      'Voltage Version': props.node.volt_version,
      'TLS Cert': props.node.tls_cert,
      Macaroon: props.node.macaroons.length > 0 ? 'Download' : 'pending',
      Seed: ['provisioning', 'waiting_init', 'initializing'].includes(props.node.status) ? 'pending' : 'View',
      'Creation Date': props.node.created,
      'Expiry Date': props.node.expires,
      'API Endpoint': props.node.api_endpoint
    }))

    async function downloadMacaroon () {
      showPasswordDialog.value = true
      try {
        const res = await connectNode(props.node.node_id, 'admin')
        const { macaroon } = res
        encrypted.value = macaroon
        encryptedType.value = 'macaroon'
        passwordDialogButton.value = 'Decrypt Macaroon'
      } catch (e) {
        error.value = e.toString()
      }
    }

    async function downloadCert () {
      try {
        const res = await getCert(props.node.node_id)
        const { tls_cert } = res
        cert.value = tls_cert
        if (cert.value === 'pending') {
          certButtonText.value = 'Certificate is pending'
        }
        certReady.value = true
      } catch (e) {
        error.value = e.toString()
      }
    }

    async function viewSeed () {
      try {
        const res = await getSeed(props.node.node_id)
        const { seed } = res
        if (seed === '') {
          seedButtonText.value = 'Seed was not found'
          return
        }
        showPasswordDialog.value = true
        encrypted.value = seed
        encryptedType.value = 'seed'
        passwordDialogButton.value = 'View Seed'
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

    function handleDownload (password: string) {
      // @ts-ignore
      try {
        const decrypted = crypto.AES.decrypt(encrypted.value || '', password).toString(crypto.enc.Base64)
        const decryptResult = atob(decrypted)
        if (isBase64(decryptResult)) {
          if (encryptedType.value === 'macaroon') {
            macaroon.value = decryptResult
            downloadReady.value = true
            showPasswordDialog.value = false
          } else if (encryptedType.value === 'seed') {
            fullSeed.value = atob(decryptResult).split(',')
            seedReady.value = true
            showPasswordDialog.value = false
          }
        } else {
          error.value = 'Incorrect password'
        }
      } catch (e) {
        console.error('cipher mismatch, macaroon decryption failed')
        console.error(e)
        error.value = e.toString()
      }
    }

    function clear () {
      downloadReady.value = false
      macaroon.value = ''
    }

    function clearCert () {
      certReady.value = false
    }

    function clearSeed () {
      seedReady.value = false
      fullSeed.value = ['']
    }

    const { copy } = useClipboard(2000)
    function copySeed () {
      const seedStr = fullSeed.value.join(' ')
      copy(seedStr)
    }

    const nodeExpired = computed(() => {
      if (props.node.purchased_type === 'paid' && props.node.purchase_status !== 'active') {
        return true
      } else {
        return false
      }
    })

    return {
      nodeInfo,
      downloadMacaroon,
      handleDownload,
      downloadReady,
      showPasswordDialog,
      passwordDialogButton,
      error,
      macaroon,
      clear,
      certReady,
      clearCert,
      downloadCert,
      cert,
      certButtonText,
      props,
      nodeExpired,
      seed,
      seedReady,
      viewSeed,
      seedButtonText,
      fullSeed,
      clearSeed,
      copySeed
    }
  }
})
</script>
