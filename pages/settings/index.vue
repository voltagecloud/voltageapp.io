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
                  v-row(align='center')
                    v-col(cols='auto') Password
                    v-spacer
                    v-dialog(max-width='800' v-model='open')
                      template(v-slot:activator='{ on }')
                        v-btn(color='secondary' v-on='on').warning--text Change Password
                      component(@done='open = false')
                  v-row(align='center')
                    v-col(cols='auto') {{ MFAText }}
                    v-spacer
                    v-dialog(max-width='800' v-model='open')
                      template(v-slot:activator='{ on }')
                        v-btn(color='secondary' v-on='on').warning--text {{MFAState ? 'Disable' : 'Enable'}} MFA
                      component(:is='MFAState ? "disable-mfa":"enable-mfa"' @done='handleComplete')
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
    const MFAState = ref('')

    async function loadMFAState () {
      if (authStore.user) {
        const user = await Auth.currentAuthenticatedUser()
        const res = await Auth.getPreferredMFA(user, {
          bypassCache: true
        })
        console.log({ res })
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
      } else if (MFAState.value) {
        return 'MFA is enabled'
      } else {
        return 'MFA is disabled'
      }
    })

    async function handleComplete () {
      open.value = false
      await loadMFAState()
    }

    return {
      MFAState,
      open,
      emailAddr,
      MFAText,
      handleComplete
    }
  }
})
</script>
