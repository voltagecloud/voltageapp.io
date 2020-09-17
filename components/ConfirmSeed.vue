<template lang="pug">
  div
    div.text-center.warning--text
      | Your seed phrase is (click to copy)
    v-divider.mx-12.mb-6
    v-fade-transition.justify-center.align-center.row.px-2(group appear tag='div' justify='center' :css='false' style='width: 100%;' @before-enter='beforeEnter' @enter='enter' @click='copySeed')
      span.seed-word.display-3.font-weight-thin.warning--text.px-3(v-for='(word, i) in lndStore.cipher_seed_mnemonic' :key='i' :data-index='i') {{ word }}
    v-divider.mx-12.mt-6
    div.text-center.warning--text.mb-12
      | Write down your seed phrase in a safe place. You will need it to recover your node and funds. Voltage is not responsible for lost seeds.
    v-btn.info--text(block color='highlight' depressed @click='confirmSeed')
      | I have written down my seed phrase
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { lndStore } from '~/store'
import useAnimation from '~/compositions/useAnimation'
import useClipboard from '~/compositions/useClipboard'

export default defineComponent({
  setup (_, { emit }) {
    // const { updateStatus } = useNodeApi(root.$nuxt.context)
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
      copySeed
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
