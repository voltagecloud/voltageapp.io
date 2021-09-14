<template lang="pug">
  v-card(color='secondary')
    v-card-title Enable MFA
    v-container.pt-0
      v-fade-transition
        v-card(v-if='step === 0' key='0' color='secondary' flat).text-center
          qrcode-vue(v-model='encodedSecret' size='300').my-3
          // copy-pill(:text='encodedSecret' color='accent' text-color='warning').text-break.my-3
          v-btn(block @click='step += 1' color='highlight' dark).my-3 I have scanned the code in Google Authenticator
        v-card(v-else ley='1' color='secondary' flat).text-center
          div Enter the code displayed in Authenticator
          v-text-field(v-model='newCode' label='Code' outlined).mt-3
          v-btn(:disabled='newCode.length < 6' @click='confirmMFA' block color='highlight' dark).mb-3.info--text Confirm MFA

</template>
<script lang="ts">
import { defineComponent, ref, computed } from '@vue/composition-api'
import Auth from '@aws-amplify/auth'
import { authStore } from '~/store'

export default defineComponent({
  components: {
    QrcodeVue: () => import('qrcode.vue'),
    CopyPill: () => import('~/components/core/CopyPill.vue')
  },
  async fetch () {
    const res = await Auth.setupTOTP(authStore.user)
    // @ts-ignore
    this.authCode = res
  },
  setup (_, { emit }) {
    const tab = ref(null)
    const authCode = ref('')
    const step = ref(0)
    const newCode = ref('')

    const encodedSecret = computed(() => {
      if (!authCode.value) { return '' }
      // @ts-ignore
      const email = authStore.user.attributes.email
      return `otpauth://totp/Voltage:${email}?secret=${authCode.value}&issuer=Voltage&algorithm=SHA1&digits=6&period=30`
    })

    async function confirmMFA () {
      if (authStore.user) {
        const res = await Auth.verifyTotpToken(authStore.user, newCode.value)
        authStore.user.setUserMfaPreference(null, {
          Enabled: true,
          PreferredMfa: true
        }, err => console.error(err))
        emit('done')
      }
    }

    return {
      tab,
      authCode,
      encodedSecret,
      step,
      newCode,
      confirmMFA
    }
  }
})
</script>
