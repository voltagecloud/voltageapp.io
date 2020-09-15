<template lang="pug">
v-container
  password-dialog(v-model='showPasswordDialog' @done='handleDownload' :error='error' text='Decrypt Macaroon')
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
          td.text-end(v-else-if='k === "Macaroon" && macaroonCount > 0')
            v-chip(
              color='accent'
              text-color='warning'
              @click='downloadMacaroon'
            ).mr-3
              | Download
          td.text-end(v-else)
            copy-pill(
              color='accent'
              text-color='warning'
              :text='v'
            ).mr-3
</template>
<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import { Node } from '~/types/apiResponse'
import useNodeApi from '~/compositions/useNodeApi'
import crypto from 'crypto-js'

export default defineComponent({
  props: {
    node: {
      type: Object as () => Node,
      required: true
    }
  },
  components: {
    CopyPill: () => import('~/components/core/CopyPill.vue'),
    PasswordDialog: () => import('~/components/PasswordDialog.vue')
  },
  setup (props, { root }) {
    const { connectNode, getCert } = useNodeApi(root.$nuxt.context)
    const showPasswordDialog = ref(false)
    const downloadReady = ref(false)
    const certReady = ref(false)
    const certButtonText = ref('Download Certificate')
    const encrypted = ref('')
    const macaroon = ref('')
    const cert = ref('')
    const error = ref('')
    const macaroonCount = props.node.macaroons.length

    const nodeInfo = computed(() => ({
      Status: props.node.status,
      'LND Version': props.node.lnd_version,
      'Voltage Version': props.node.volt_version,
      'TLS Cert': props.node.tls_cert,
      'Macaroon': 'pending',
      'Creation Date': props.node.created,
      'Expiry Date': props.node.expires,
      'API Endpoint': props.node.api_endpoint
    }))

    async function downloadMacaroon () {
      showPasswordDialog.value = true
      try {
        const res = await connectNode(props.node.node_id, 'admin')
        var { macaroon } = res
        encrypted.value = macaroon
      } catch (e) {
        error.value = e.toString()
      }
    }

    async function downloadCert () {
      try {
        const res = await getCert(props.node.node_id)
        var { tls_cert } = res
        cert.value = tls_cert
        if (cert.value == "pending") {
          certButtonText.value = 'Certificate is pending'
        }
        certReady.value = true
      } catch (e) {
        error.value = e.toString()
      }
    }

    // @ts-ignore
    function isBase64 (str) {
        if (str ==='' || str.trim() ===''){ return false; }
        try {
            return btoa(atob(str)) == str;
        } catch (err) {
            return false;
        }
    }

    function handleDownload (password: string) {
      // @ts-ignore
      try {
        const decrypted = crypto.AES.decrypt(encrypted.value || '', password).toString(crypto.enc.Base64)
        const decryptResult = atob(decrypted)
        if (isBase64(decryptResult)) {
          macaroon.value = decryptResult
          downloadReady.value = true
          showPasswordDialog.value = false
        } else {
          error.value = 'Incorrect password'
        }
      } catch (e) {
        console.error('cipher mismatch, macaroon decryption failed')
        console.error(e)
        error.value = e.toString()
      }
    }

    const disabledStatus = ['provisioning', 'waiting_init']

    async function clear () {
      downloadReady.value = false
    }

    async function clearCert () {
      certReady.value = false
    }

    return {
      nodeInfo,
      downloadMacaroon,
      handleDownload,
      downloadReady,
      showPasswordDialog,
      error,
      macaroon,
      clear,
      disabledStatus,
      certReady,
      clearCert,
      downloadCert,
      cert,
      certButtonText,
      macaroonCount
    }
  }
})
</script>
