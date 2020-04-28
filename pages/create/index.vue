<template lang="pug">
  v-container.align-container
    v-row(justify='center' align='center' style='height: 100%')
      v-col(cols='12' xl='8')
        v-fade-transition(mode='out-in')
          create-type(v-if='currentStep == 0' key='0')
          create-node(v-else-if='currentStep == 1' key='1')
          confirm-seed(v-else-if='currentStep == 2' key='2')
</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted } from '@vue/composition-api'
import useNodeApi from '~/compositions/useNodeApi'
import useAnimation from '~/compositions/useAnimation'
import { createStore, layoutStore } from '~/store'

export default defineComponent({
  components: {
    CreateType: () => import('~/components/CreateType.vue'),
    CreateNode: () => import('~/components/CreateNode.vue'),
    ConfirmSeed: () => import('~/components/ConfirmSeed.vue')
  },
  middleware: ['assertAuthed', 'loadUser'],
  setup (_, {root}) {
    
    layoutStore.DRAWER(false)

    const currentStep = computed(() => createStore.currentStep)

    return {
      currentStep
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
