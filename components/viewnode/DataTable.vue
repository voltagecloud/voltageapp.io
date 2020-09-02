<template lang="pug">
v-container
  password-dialog(v-model='showPasswordDialog' @done='handleDownload' :error='error' text='Download Macaroon')
  v-dialog(v-if='downloadReady' max-width='800')
    v-card.text-center(style='padding: 20px;')
      v-card-actions
          v-btn(type='submit' color='highlight' block).info--text Download Macaroon
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
              :href='"data:application/text-plain;base64,"+v',
              download='tls.cert',
              title='tls.cert'
            ).mr-3
              | Download
          td.text-end(v-else-if='k === "Macaroon"')
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
    const nodeInfo = computed(() => ({
      Status: props.node.status,
      'LND Version': props.node.lnd_version,
      'Voltage Version': props.node.volt_version,
      'TLS Cert': props.node.tls_cert,
      'Macaroon': 'Download',
      'Creation Date': props.node.created,
      'Expiry Date': props.node.expires,
      'API Endpoint': props.node.api_endpoint
    }))

    const { connectNode } = useNodeApi(root.$nuxt.context)
    const showPasswordDialog = ref(false)
    const downloadReady = ref(false)
    const encrypted = ref('')
    const error = ref('')

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

    // @ts-ignore
    function isBase64 (str) {
        if (str ==='' || str.trim() ===''){ return false; }
        try {
            return btoa(atob(str)) == str;
        } catch (err) {
            return false;
        }
    }

    async function handleDownload (password: string) {
      // @ts-ignore
      try {
        const decrypted = crypto.AES.decrypt(encrypted.value || '', password).toString(crypto.enc.Base64)
        const decryptResult = atob(decrypted)
        if (isBase64(decryptResult)) {
          //macaroon.value = decryptResult
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

    return {
      nodeInfo,
      downloadMacaroon,
      handleDownload,
      downloadReady,
      showPasswordDialog,
      error
    }
  }
})
</script>
