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
          div(justify='center' align='center' style='margin: auto;')
            v-row(style='padding-bottom: 50px')
              v-col(cols='12' lg='4')
                v-btn(fab icon tile raised elevation="12" value='lite' @click='typeSelect' :style='((chosenType == "lite") ? "border: solid; border-color: #1d437b; background: #ffffff;" : "background: #e4e4e4;") + "border-radius: 5px; width: 125px; height: 75px;"')
                  v-col
                    | Lite
                    br
                    | ({{liteCount}})
              v-col(cols='12' lg='4')
                v-btn(fab icon tile raised elevation="12" value='standard' @click='typeSelect' :style='((chosenType == "standard") ? "border: solid; border-color: #1d437b; background: #ffffff;" : "background: #e4e4e4;") + " border-radius: 5px; width: 125px; height: 75px;"')
                  v-col
                    | Standard
                    br
                    | ({{standardCount}})
              v-col(cols='12' lg='4')
                v-btn(fab icon tile raised elevation="12" value='trial' @click='typeSelect' :style='((chosenType == "trial") ? "border: solid; border-color: #1d437b; background: #ffffff;" : "background: #e4e4e4;") + " border-radius: 5px; width: 125px; height: 75px;"')
                  v-col
                    | Trial
                    br
                    | ({{trialCount}})
          v-col(cols='12')
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
    const standardCount = nodeStore.user.available_nodes
    // @ts-ignore
    const liteCount = nodeStore.user.available_lite_nodes
    // @ts-ignore
    const trialCount = nodeStore.user.trial_available ? 1 : 0
    // @ts-ignore
    const chosenNetwork = ref(nodeStore.user.trial_available ? "testnet" : "mainnet")

    const { createNode, loading } = useNodeApi(root.$nuxt.context)

    // @ts-ignore
    const chosenType = ref(nodeStore.user.trial_available ? 'trial' : (nodeStore.user.available_lite_nodes > 0 ? 'lite' : 'standard'))

    const clickedButton = ref<null|number>(null)
    const errorMessage = ref('')

    // @ts-ignore
    const createText = ref(nodeStore.user.trial_available ? 'Create' : nodeStore.user.available_nodes > 0 ? 'Create' : 'Purchase')

    async function chooseNetwork() {
      loading.value = true
      if (chosenNetwork.value == 'testnet') {
        // @ts-ignore
        if (chosenType.value === "trial" && nodeStore.user.trial_available) {
          // @ts-ignore
          createStore.NODE_TYPE({ network: Network.testnet, trial: true, type: chosenType.value })
          await createNode()
          createStore.STEP(1)
          window.scrollTo(0,0)
        // @ts-ignore
        } else if (chosenType.value == "standard" && nodeStore.user.available_nodes > 0) {
          // @ts-ignore
          createStore.NODE_TYPE({ network: Network.testnet, trial: false, type: chosenType.value })
          await createNode()
          createStore.STEP(1)
          window.scrollTo(0,0)
        // @ts-ignore
        } else if (chosenType.value == "lite" && nodeStore.user.avialable_lite_nodes) {
          // @ts-ignore
          createStore.NODE_TYPE({ network: Network.testnet, trial: false, type: chosenType.value })
          await createNode()
          createStore.STEP(1)
          window.scrollTo(0,0)
        } else {
          root.$router.push('/purchase')
        }
      } else {
        // @ts-ignore
        if (chosenType.value == "standard" && nodeStore.user.available_nodes > 0) {
          // @ts-ignore
          createStore.NODE_TYPE({ network: Network.mainnet, trial: false, type: chosenType.value })
          await createNode()
          createStore.STEP(1)
          window.scrollTo(0,0)
        // @ts-ignore
        } else if (chosenType.value == "lite" && nodeStore.user.avialable_lite_nodes) {
          // @ts-ignore
          createStore.NODE_TYPE({ network: Network.testnet, trial: false, type: chosenType.value })
          await createNode()
          createStore.STEP(1)
          window.scrollTo(0,0)
        } else {
          root.$router.push('/purchase')
        }
      }
      loading.value = false
    }

    function typeSelect (event: any) {
      chosenType.value = event.currentTarget.getAttribute('value')
      // @ts-ignore
      if (chosenType.value === "trial" && !nodeStore.user.trial_available) {
        createText.value = 'Purchase'
      // @ts-ignore
      } else if (chosenType.value == "lite" && nodeStore.user.available_lite_nodes == 0) {
        createText.value = 'Purchase'
      // @ts-ignore
      } else if (chosenType.value == "standard" && nodeStore.user.available_nodes == 0) {
        createText.value = 'Purchase'
      } else{
        createText.value = 'Create'
      }
    }

    async function handleNetwork () {
      if (chosenNetwork.value == 'testnet') {
        // @ts-ignore
        if (chosenType.value === "trial" && nodeStore.user.trial_available) {
          createText.value = 'Create'
        // @ts-ignore
        } else if (chosenType.value == "standard" && nodeStore.user.available_nodes > 0) {
          createText.value = 'Create'
        // @ts-ignore
        } else if (chosenType.value == "lite" && nodeStore.user.available_lite_nodes > 0) {
          createText.value = 'Create'
        } else {
          createText.value = 'Purchase'
        }
      } else {
        // @ts-ignore
        if (chosenType.value == "standard" && nodeStore.user.available_nodes > 0) {
          createText.value = 'Create'
        // @ts-ignore
        } else if (chosenType.value == "lite" && nodeStore.user.available_lite_nodes > 0) {
          createText.value = 'Create'
        } else {
          createText.value = 'Purchase'
        }
      }
    }

    return {
      standardCount,
      liteCount,
      trialCount,
      loading,
      clickedButton,
      chooseNetwork,
      createText,
      chosenNetwork,
      errorMessage,
      handleNetwork,
      chosenType,
      typeSelect
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
