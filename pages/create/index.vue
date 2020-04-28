<template>
  <v-container style="height: 100%">
    <v-row justify="center" align="center" style="height: 100%">
      <v-col cols="12" md="10" xl="6">
        <v-fade-transition mode="out-in">
          <CreateNode v-if="seed.length === 0 || !seed" key="create" />
          <div v-else key="seed">
            <div class="text-center warning--text">
              Your seed phrase is
            </div>
            <v-divider class="mx-12 mb-6" />
            <v-fade-transition
              key="seed"
              group
              appear
              tag="div"
              name="staggerd-fade"
              justify="center"
              :css="false"
              class="justify-center align-center row px-2"
              style="width: 100%;"
              @before-enter="beforeEnter"
              @enter="enter"
            >
              <span
                v-for="(word, i) in seed"
                :key="i"
                :data-index="i"
                class="seed-word display-3 font-weight-thin warning--text px-3"
              >{{ word }}</span>
            </v-fade-transition>
            <v-divider class="mx-12 mt-6" />
            <div class="text-center warning--text mb-12">
              Write down your seed phrase in a safe place. You will need it to recover your node.
            </div>
            <v-btn
              block
              color="accent"
              class="warning--text"
              depressed
              :loading="loading"
              @click="confirmSeed"
            >
              I have written down my seed phrase
            </v-btn>
          </div>
        </v-fade-transition>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from '@vue/composition-api'
import useNodeApi from '~/compositions/useNodeApi'
import useAnimation from '~/compositions/useAnimation'
import { createStore } from '~/store'

export default defineComponent({
  components: {
    CreateNode: () => import('~/components/CreateNode.vue')
  },
  middleware: ['assertAuthed', 'loadUser'],
  setup (_, {root}) {
    const { loading, createNode } = useNodeApi(root.$nuxt.context)
    const { beforeEnter, enter } = useAnimation()

    const seed = computed(() => createStore.seed)

    async function confirmSeed () {
      await createNode()
      root.$router.push(`/node/${createStore.newNodeID}`)
    }

    return {
      loading,
      confirmSeed,
      beforeEnter,
      enter,
      seed
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
