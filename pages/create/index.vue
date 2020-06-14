<template lang="pug">
  v-container
    v-row(justify='center' align='start')
      v-col(cols='12')
        v-container
          v-row(justify='center')
            v-btn(
              v-for='i in steps'
              :key='i' :disabled='i > currentStep'
              :class='{ "v-btn--active": i == currentStep }'
              @click="currentStep=i"
              outlined 
              fab
            ).mx-3 {{i + 1}}
      v-col(cols='12' xl='8')
        v-scroll-x-transition(mode='out-in' :hide-on-leave='false')
          component(:is='currentComponent')

</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted } from '@vue/composition-api'
import useNodeApi from '~/compositions/useNodeApi'
import useAnimation from '~/compositions/useAnimation'
import { createStore, layoutStore } from '~/store'

export default defineComponent({
  components: {
    CreateType: () => import('~/components/CreateType.vue'),
    CreateNode: () => import('~/components/CreateNode.vue')
    // ConfirmSeed: () => import('~/components/ConfirmSeed.vue')
  },
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  setup (_, {root}) {
    
    layoutStore.DRAWER(false)
    layoutStore.SET_TITLE('Create Node')
    const steps = ref([0,1])
    const currentStep = computed({
      get: () => createStore.currentStep,
      set: (v: number) => createStore.STEP(v)
    })
    currentStep.value = 0
    createStore.SEED([])
    const currentComponent = computed(() => {
      if (currentStep.value == 0) {
        return 'create-type'
      } else if (currentStep.value == 1) {
        return 'create-node'
      }
    })

    return {
      currentStep,
      steps,
      currentComponent
    }
  }
})
</script>


