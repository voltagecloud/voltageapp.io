<template lang="pug">
  v-container(style='height: 100%;')
    v-card(color='info' height='100%')
      v-card-title.font-weight-light.warning--text.text--darken-1.v-card--title Choose Node Type
      div(justify='center' align='center' style='margin: auto;')
        v-row(style='padding-bottom: 50px')
          v-col(cols='12' lg='4')
            v-btn(fab icon tile raised elevation="12" style='border-radius: 5px; border: solid; border-color: #1d437b; background: #ffffff;  width: 200px; height: 150px;')
              v-col
                img(src="/images/lnd-logo.png" width="105")
          v-col(cols='12' lg='4')
            v-btn(fab icon tile raised elevation="12" :disabled='true' style='background: #e4e4e4; border-radius: 5px; width: 200px; height: 150px;')
              v-col
                img(src="/images/c-lightning-logo.png" width="125" style="padding-bottom: 10px")
                br
                | Not Yet Available
          v-col(cols='12' lg='4')
            v-btn(fab icon tile raised elevation="12" :disabled='true' style='background: #e4e4e4; border-radius: 5px; width: 200px; height: 150px;')
              v-col
                img(src="/images/eclair-logo.png" width="125" style="padding-bottom: 10px")
                br
                | Not Yet Available

        v-row(justify='center' style='max-width: 65%;')
          v-col(cols='12')
            p.font-weight-light.warning--text(style='font-size: 20px;')
              | {{ stdMsg }}
            v-card-title.font-weight-light.warning--text.text--darken-1.v-card--title
              | Choose Network
            v-select.text--darken-1(
              v-model='chosenNetwork'
              :items='["mainnet", "testnet"]'
              :error-messages='errorMessage'
              placeholder='Choose Network'
              color='highlight'
              background-color='secondary'
              outlined
              @change='handleNetwork'
            )
          v-col(cols='12')
            v-btn(style="background: #ffffff;" @click='chooseNetwork' :loading='loading' block).warning--text {{ createText }}

</template>
<script lang="ts">
import { defineComponent, reactive, computed, ref } from '@vue/composition-api'
import { nodeStore, createStore } from '~/store'
import { Network } from '~/types/api'
import useNodeApi from '~/compositions/useNodeApi'

export default defineComponent({
  setup (_, { root }) {
    // @ts-ignore
    const stdMsg = `You have ${nodeStore.user.available_nodes} paid nodes and ${nodeStore.user.trial_available ? 1 : 0} trial nodes available.`
    // @ts-ignore
    const chosenNetwork = ref(nodeStore.user.trial_available ? "testnet" : "mainnet")

    const { createNode, loading } = useNodeApi(root.$nuxt.context)

    const clickedButton = ref<null|number>(null)
    const errorMessage = ref('')

    // @ts-ignore
    const createText = ref(nodeStore.user.trial_available ? 'Create Trial' : nodeStore.user.available_nodes > 0 ? 'Create' : 'Purchase')

    async function chooseNetwork() {
      loading.value = true
      if (chosenNetwork.value == 'testnet') {
        // @ts-ignore
        if (nodeStore.user.trial_available) {
          // @ts-ignore
          createStore.NODE_TYPE({ network: Network.testnet, trial: true })
          await createNode()
          createStore.STEP(1)
          window.scrollTo(0,0)
        // @ts-ignore
        } else if (nodeStore.user.available_nodes > 0) {
          // @ts-ignore
          createStore.NODE_TYPE({ network: Network.testnet, trial: false })
          await createNode()
          createStore.STEP(1)
          window.scrollTo(0,0)
        } else {
          root.$router.push('/purchase')
        }
      } else {
        // @ts-ignore
        if (nodeStore.user.available_nodes > 0) {
          // @ts-ignore
          createStore.NODE_TYPE({ network: Network.mainnet, trial: false })
          await createNode()
          createStore.STEP(1)
          window.scrollTo(0,0)
        } else {
          root.$router.push('/purchase')
        }
      }
      loading.value = false
    }

    async function handleNetwork () {
      if (chosenNetwork.value == 'testnet') {
        // @ts-ignore
        if (nodeStore.user.trial_available) {
          createText.value = 'Create Trial'
        // @ts-ignore
        } else if (nodeStore.user.available_nodes > 0) {
          createText.value = 'Create'
        } else {
          createText.value = 'Purchase'
        }
      } else {
        // @ts-ignore
        if (nodeStore.user.available_nodes > 0) {
          createText.value = 'Create'
        } else {
          createText.value = 'Purchase'
        }
      }
    }

    return {
      stdMsg,
      loading,
      clickedButton,
      chooseNetwork,
      createText,
      chosenNetwork,
      errorMessage,
      handleNetwork
    }
  }
})
</script>
<style lang="scss" scoped>
.make-bottom {
  bottom: 0;
  width: 100%;
  position: absolute;

  div {
    width: 100%;
  }
}

.pad-bottom {
  padding-bottom: 48px;
}

.v-card--hover {
  transition: all 0.5s;
  &:hover {
    transform: translateY(-3px);
  }
}
</style>
