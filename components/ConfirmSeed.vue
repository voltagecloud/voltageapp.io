<template lang="pug">
  div
    div.text-center.warning--text.display-1
      | Your seed phrase is 
    v-divider.mx-12.mb-6
    v-fade-transition.justify-center.align-center.row.px-2(group appear tag='div' justify='center' :css='false' style='width: 100%;' @before-enter='beforeEnter' @enter='enter')
      span.seed-word.display-3.font-weight-thin.warning--text.px-3(v-for='(word, i) in lndStore.cipher_seed_mnemonic' :key='i' :data-index='i') {{ word }}
    v-divider.mx-12.mt-6
    div.text-center.warning--text.mb-12
      | Write down your seed phrase in a safe place. You will need it to recover your node and funds. Voltage is not responsible for lost seeds.
      p
      v-chip(color='accent' text-color='warning' @click='copySeed').align-center.justify-center
        | Click Here to Copy Seed
    v-btn.info--text(block color='highlight' depressed @click='confirmModal = true')
      | I have written down my seed phrase
    v-dialog(v-model='confirmModal' max-width='800')
      v-card
        v-card-text.pt-3.font-weight-light.warning--text.text--darken-1
          | Are you positive you wrote this seed down in a safe place?
          | No one, including Voltage, will be able to recover your node if this is lost.
        v-card-actions
          v-btn(color='info' @click='closeAndConfirm') Yes
          v-btn(@click='confirmModal = false') No
</template>
<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import { lndStore } from '~/store'
import useAnimation from '~/compositions/useAnimation'
import useClipboard from '~/compositions/useClipboard'

export default defineComponent({
  setup (_, { root, emit }) {
    const confirmModal = ref(false)

    async function closeAndConfirm () {
      confirmModal.value = false
      await confirmSeed()
    }

    function confirmSeed () {
      emit('next')
    }

    const { copy } = useClipboard(2000)
    function copySeed () {
      const seedStr = lndStore.cipher_seed_mnemonic.join(' ')
      copy(seedStr)
    }

    const { beforeEnter, enter } = useAnimation()

    return {
      lndStore,
      confirmSeed,
      beforeEnter,
      enter,
      copySeed,
      confirmModal,
      closeAndConfirm
    }
  }
})
</script>
<style lang="scss" scoped>
.seed-word {
  transition: all 0.5s ease-in-out;
  word-spacing: 1rem;
}
</style>
