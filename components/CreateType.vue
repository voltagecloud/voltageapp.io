<template lang="pug">
  v-container(style='height: 100%;')
    v-row(style='height: 100%;' justify='center')
      v-col(cols='12' lg='4' v-for='(card, i) in cards' :key='i')
        v-card(color='info' height='100%' hover).pad-bottom
          v-card-title.font-weight-light.warning--text.text--darken-1 {{ card.nodeType }}
          v-card-text(style='line-height: 1.7em;') {{ card.desc }}
          v-card-actions.make-bottom
            v-tooltip(top :disabled='!card.disabled')
              template(v-slot:activator='{ on }')
                div(v-on='on')
                  v-btn(
                    @click='card.selectFn'
                    :disabled='card.disabled || (loading && clickedButton !== i)'
                    color='secondary'
                    block
                    :loading='loading && clickedButton === i'
                  ).warning--text {{ card.buttonText }}
              span {{ card.disabledMsg }}
</template>
<script lang="ts">
import { defineComponent, reactive, computed, ref } from '@vue/composition-api'
import { nodeStore, createStore } from '~/store'
import { Network } from '~/types/api'
import useNodeApi from '~/compositions/useNodeApi'

export default defineComponent({
  setup (_, { root }) {
    const stdMsg = 'You dont have any available nodes. Purchase one to create this node type.'

    const { createNode, loading } = useNodeApi(root.$nuxt.context)

    const clickedButton = ref<null|number>(null)

    const cards = reactive([
      {
        nodeType: 'Mainnet',
        // @ts-ignore
        buttonText: nodeStore.user.available_nodes === 0 ? 'Purchase' : 'Create',
        desc: 'Create a standard mainnet lightning node. Send and receive instant Bitcoin payments.',
        selectFn: async () => {
          // @ts-ignore
          if (nodeStore.user.available_nodes === 0) {
            root.$router.push('/purchase')
          } else {
            clickedButton.value = 0
            createStore.WIPE()
            createStore.NODE_TYPE({ network: Network.mainnet, trial: false })
            await createNode()
            createStore.STEP(1)
          }
        },
        disabled: false,
        disabledMsg: stdMsg
      },
      {
        nodeType: 'Testnet (trial)',
        buttonText: 'Create',
        desc: 'Create a trial testnet lightning node. Experiment with test Bitcoins. This node will expire after one week.',
        selectFn: async () => {
          clickedButton.value = 1
          createStore.WIPE()
          createStore.NODE_TYPE({ network: Network.testnet, trial: true })
          await createNode()
          createStore.STEP(1)
        },
        disabled: !nodeStore.user || !nodeStore.user.trial_available,
        disabledMsg: 'You have already used your trial. Please purchase a node.'
      },
      {
        nodeType: 'Testnet (persistent)',
        // @ts-ignore
        buttonText: nodeStore.user.available_nodes === 0 ? 'Purchase' : 'Create',
        desc: 'Create a testnet lightning node. Experiment with test Bitcoins. This node will not expire.',
        selectFn: async () => {
          // @ts-ignore
          if (nodeStore.user.available_nodes === 0) {
            root.$router.push('/purchase')
          } else {
            clickedButton.value = 2
            createStore.WIPE()
            createStore.NODE_TYPE({ network: Network.testnet, trial: false })
            await createNode()
            createStore.STEP(1)
          }
        },
        disabled: false,
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
