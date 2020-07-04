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
                    v-col(cols='auto') MFA is {{MFAState ? 'enabled': 'disabled'}}
                    v-spacer
                    v-dialog(max-width='800' v-model='open')
                      template(v-slot:activator='{ on }')
                        v-btn(color='secondary' v-on='on').warning--text {{MFAState ? 'Disable' : 'Enable'}} MFA
                      component(:is='MFAState ? "disable-mfa":"enable-mfa"' @done='open = false')
</template>
<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import { authStore } from '~/store'

export default defineComponent({
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  components: {
    EnableMfa: () => import('~/components/EnableMfa.vue')
  },
  setup () {
    // @ts-ignore
    const MFAState = computed(() => !!authStore.user && authStore.user.preferredMFA != 'NOMFA')
    const open = ref(false)
    console.log(authStore.user)

    return {
      MFAState,
      open
    }
  }
})
</script>