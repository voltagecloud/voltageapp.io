<template lang="pug">
  v-container
    v-card(color='secondary')
      components(:is='component' @next='() => { currentStep += 1 }' @done='back')
</template>
<script lang="ts">
import { defineComponent, ref, computed } from '@vue/composition-api'
import { lndStore } from '~/store'

export default defineComponent({
  components: {
    ConfirmSeed: () => import('~/components/ConfirmSeed.vue'),
    SeedPassword: () => import('~/components/SeedPassword.vue'),
    DownloadMacaroon: () => import('~/components/DownloadMacaroon.vue')
  },
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  setup (_, context) {
    if (lndStore.cipher_seed_mnemonic.length !== 24) {
      back()
    }

    function back () {
      context.root.$router.go(-1)
    }

    const currentStep = ref(0)
    const component = computed(() => (currentStep.value === 0) ? 'confirm-seed' : (currentStep.value === 1) ? 'seed-password' : 'download-macaroon')
    return {
      component,
      currentStep,
      back
    }
  }
})
</script>
