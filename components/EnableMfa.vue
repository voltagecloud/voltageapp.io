<template lang="pug">
  v-card(color='secondary')
    v-card-title Enable MFA
    v-container.py-0
      v-tabs(centered background-color='transparent' color='primary' grow v-model='tab')
        v-tab(:key='0') Google Authenticator
        v-tab(:key='1') SMS
      v-tabs-items(v-model='tab')
        v-tab-item(:key='0')
          v-card(color='secondary' flat).text-center
            qrcode-vue(v-model='authCode' size='300').my-3
            copy-pill(:text='authCode' color='accent' text-color='warning').text-break
        v-tab-item(:key='1')
          v-card(color='secondary' flat)
            v-text-field(outlined label='Phone Number')

          
</template>
<script lang="ts">
import { defineComponent, ref, onMounted } from '@vue/composition-api'
import Auth from '@aws-amplify/auth'
import useFormValidation from '~/compositions/useFormValidation'
import { authStore } from '~/store'

export default defineComponent({
  components: {
    QrcodeVue: () => import('qrcode.vue'),
    CopyPill: () => import('~/components/core/CopyPill.vue')
  },
  async fetch () {
    const res = await Auth.setupTOTP(authStore.user)
    console.log({res})
    // @ts-ignore
    this.authCode = res
  },
  setup () {
    const tab = ref(null)
    const phoneNumber = ref('')
    const authCode = ref('')

    async function setSMS () {
      const res = await Auth.setPreferredMFA(authStore.user, 'SMS')
      console.log({res})
    }

    return {
      tab,
      authCode,
      setSMS
    }
  }
})
</script>