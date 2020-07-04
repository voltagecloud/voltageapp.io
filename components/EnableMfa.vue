<template lang="pug">
  v-card(color='secondary')
    v-card-title Enable MFA
    v-container.pt-0
      v-fade-transition
        v-card(v-if='step === 0' key='0' color='secondary' flat).text-center
          qrcode-vue(v-model='encodedSecret' size='300').my-3
          copy-pill(:text='encodedSecret' color='accent' text-color='warning').text-break.my-3
          v-btn(block @click='step += 1' color='info').my-3 I have scanned the code in Google Authenticator
        v-card(v-else ley='1' color='secondary' flat).text-center
          div Enter the code displayed in Authenticator
          v-text-field(v-model='newCode' label='Code' outlined).mt-3
          v-btn(:disabled='newCode.length < 6' @click='confirmMFA' block).mb-3 Confirm MFA

          
</template>
<script lang="ts">
import { defineComponent, ref, onMounted, computed } from '@vue/composition-api'
import Auth, { CognitoUser } from '@aws-amplify/auth'
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
  setup (_, { emit }) {
    const tab = ref(null)
    const phoneNumber = ref('')
    const authCode = ref('')
    const step = ref(0)
    const newCode = ref('')


    const encodedSecret = computed(() => {
      if (!authCode.value) return ''
      const username = authStore.user?.getUsername()
      return `otpauth://totp/Voltage:${username}?secret=${authCode.value}&issuer=Voltage&algorithm=SHA1&digits=6&period=30`
    })

    async function confirmMFA () {
      const res = await Auth.verifyTotpToken(authStore.user, newCode.value)
      authStore.user?.setUserMfaPreference(null, {
        Enabled: true,
        PreferredMfa: true
      }, (err) => console.error(err))
      console.log({ res })
      emit('done')
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