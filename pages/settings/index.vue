<template lang="pug">
  v-container
    v-row(justify='center')
      v-col(cols='12' xl='8')
        v-card(color='info')
          v-container.py-0
            v-row
              v-col(cols='12')
                v-container.py-0
                  v-row(align='center')
                    v-col(cols='auto') Email:
                    v-spacer
                     v-col(cols='auto').warning--text {{emailAddr}}
                  v-divider
                  v-row(align='center')
                    v-col(cols='auto') Password
                    v-spacer
                    v-dialog(max-width='800' v-model='open')
                      template(v-slot:activator='{ on }')
                        v-btn(color='secondary' v-on='on').warning--text Change Password
                      component(@done='open = false')
                  v-divider
                  v-row(align='center')
                    v-col(cols='auto') {{ MFAText }}
                    v-spacer
                    template(v-if='!MFAEnabled')
                      v-dialog(max-width='800' v-model='open')
                        template(v-slot:activator='{ on }')
                          v-btn(color='secondary' v-on='on' :loading='loading').warning--text Enable MFA
                        enable-mfa(@done='handleComplete')
                    template(v-else)
                      v-btn(color='secondary' @click='disableMfa' :loading='loading').warning--text Disable MFA
</template>
<script lang="ts">
import { defineComponent, computed, ref, onMounted } from '@vue/composition-api'
import Auth from '@aws-amplify/auth'
import { authStore } from '~/store'

export default defineComponent({
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  components: {
    EnableMfa: () => import('~/components/EnableMfa.vue')
  },
  setup () {
    const loading = ref(true)
    const MFAState = ref('NOMFA')
    const MFAEnabled = computed(() => MFAState.value === 'SOFTWARE_TOKEN_MFA')

    async function loadMFAState () {
      if (authStore.user) {
        loading.value = true
        const user = await Auth.currentAuthenticatedUser()
        const res = await Auth.getPreferredMFA(user, {
          bypassCache: true
        })
        MFAState.value = res
        loading.value = false
      }
    }

    onMounted(loadMFAState)

    const open = ref(false)
    // @ts-ignore
    const emailAddr = authStore.user.attributes.email

    const MFAText = computed(() => {
      if (loading.value) {
        return 'Loading MFA settings...'
      } else if (MFAEnabled.value) {
        return 'MFA is enabled'
      } else {
        return 'MFA is disabled'
      }
    })

    async function handleComplete () {
      open.value = false
      await loadMFAState()
    }

    async function disableMfa () {
      loading.value = true
      const user = await Auth.currentAuthenticatedUser()
      const disable = await Auth.setPreferredMFA(user, 'NOMFA')
      await loadMFAState()
      loading.value = false
    }

    return {
      MFAState,
      open,
      emailAddr,
      MFAText,
      handleComplete,
      disableMfa,
      MFAEnabled,
      loading
    }
  }
})
</script>
