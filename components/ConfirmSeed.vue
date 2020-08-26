<template lang="pug">
  div
    div.text-center.warning--text
      | Your seed phrase is
    v-divider.mx-12.mb-6
    v-fade-transition.justify-center.align-center.row.px-2(group appear tag='div' justify='center' :css='false' style='width: 100%;' @before-enter='beforeEnter' @enter='enter')
      span.seed-word.display-3.font-weight-thin.warning--text.px-3(v-for='(word, i) in lndStore.cipher_seed_mnemonic' :key='i' :data-index='i') {{ word }}
    v-divider.mx-12.mt-6
    div.text-center.warning--text.mb-12
      | Write down your seed phrase in a safe place. You will need it to recover your node.
    v-btn.warning--text(block color='accent' depressed @click='confirmSeed')
      | I have written down my seed phrase
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { lndStore } from '~/store'
import useAnimation from '~/compositions/useAnimation'

export default defineComponent({
  setup (_, { emit }) {
    function confirmSeed () {
      emit('next')
    }

    const { beforeEnter, enter } = useAnimation()

    return {
      lndStore,
      confirmSeed,
      beforeEnter,
      enter
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
