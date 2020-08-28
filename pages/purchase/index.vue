<template lang="pug">
    v-container
        v-card(color='info')
            div(style='padding: 20px;').text-center
                v-card-text.highlight--text.display-1 Lightning Node
                div.text-center.warning--text.mb-6
                  | Create your own Lightning Node for Mainnet or Testnet that never expires. Provision and connect to your node in less than two minutes.
                v-container
                  v-row.no-gutters
                    v-col(cols='12' md='6')
                      v-card(class='pa-2').outlined
                        | node 1
                  v-row.no-gutters
                    v-col(cols='12' md='6')
                      v-card(class='pa-2').outlined
                        | node 2

</template>
<script lang="ts">
import { defineComponent, reactive, computed, ref } from '@vue/composition-api'
import { nodeStore, createStore } from '~/store'
import { Network } from '~/types/api'
import useNodeApi from '~/compositions/useNodeApi'

export default defineComponent({
  setup (_, { root }) {
    const stdMsg = 'You dont have any available nodes. Purchase one to create this node type.'
    const stdDisabled = computed(() => !nodeStore.user || nodeStore.user.available_nodes === 0)

    const { createNode, loading } = useNodeApi(root.$nuxt.context)

    const clickedButton = ref<null|number>(null)

    const cards = reactive([
      {
        nodeType: 'Mainnet',
        desc: 'Create a standard mainnet lightning node. Send and receive instant Bitcoin payments.',
        selectFn: async () => {
          clickedButton.value = 0
          createStore.WIPE()
          createStore.NODE_TYPE({ network: Network.mainnet, trial: false })
          await createNode()
          createStore.STEP(1)
        },
        disabled: stdDisabled.value,
        disabledMsg: stdMsg
      },
      {
        nodeType: 'Testnet (trial)',
        desc: 'Create a trial testnet lightning node. Experiment with test Bitcoins. This node will expire after one week.',
        selectFn: async () => {
          clickedButton.value = 1
          createStore.WIPE()
          createStore.NODE_TYPE({ network: Network.testnet, trial: true })
          await createNode()
          createStore.STEP(1)
        },
        disabled: !nodeStore.user || !nodeStore.user.trial_available,
        disabledMsg: 'You already have a trial node active'
      },
      {
        nodeType: 'Testnet (persistent)',
        desc: 'Create a testnet lightning node. Experiment with test Bitcoins. This node will not expire.',
        selectFn: async () => {
          clickedButton.value = 2
          createStore.WIPE()
          createStore.NODE_TYPE({ network: Network.testnet, trial: false })
          await createNode()
          createStore.STEP(1)
        },
        disabled: stdDisabled.value,
        disabledMsg: stdMsg
      }
    ])


    return {
      cards,
      loading,
      clickedButton
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
