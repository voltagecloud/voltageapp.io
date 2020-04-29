<template lang="pug">
  v-container(style='height: 100%;')
    v-row(style='height: 100%;' justify='center')
      v-col(cols='12' md='4' v-for='(card, i) in cards' :key='i')
        v-card(color='info' height='100%' hover).pad-bottom
          v-card-title.font-weight-light.warning--text.text--darken-1 {{ card.nodeType }}
          v-card-text {{ card.desc }}
          v-card-actions.make-bottom
            v-tooltip(top :disabled='!card.disabled')
              template(v-slot:activator='{ on }')
                div(v-on='on')
                  v-btn(@click='card.selectFn' :disabled='card.disabled' color='secondary' block ).warning--text Create
              span {{ card.disabledMsg }}
</template>
<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import { nodeStore, createStore } from '~/store'
import { Network } from '../types/api'

export default defineComponent({
  setup () {
    const stdMsg = 'You dont have any available nodes. Purchase one to create this node type.'
    const stdDisabled = computed(() => !nodeStore.user || nodeStore.user.available_nodes == 0)

    const cards = reactive([
      {
        nodeType: 'Mainnet',
        desc: 'Create a standard mainnet lightning node. Send and receive instant Bitcoin payments.',
        selectFn: () => {
          createStore.NODE_TYPE({network: Network.mainnet, trial: false})
          createStore.STEP(1)
        },
        disabled: stdDisabled.value,
        disabledMsg: stdMsg
      },
      {
        nodeType: 'Testnet (trial)',
        desc: 'Create a trial testnet lightning node. Experiment with test Bitcoins. This node will expire after one week.',
        selectFn: () => {
          createStore.NODE_TYPE({network: Network.testnet, trial: true})
          createStore.STEP(1)
        },
        disabled: !nodeStore.user || !nodeStore.user.trial_available,
        disabledMsg: 'You already have a trial node active'
      },
      {
        nodeType: 'Testnet (persistent)',
        desc: 'Create a testnet lightning node. Experiment with test Bitcoins. This node will not expire.',
        selectFn: () => {
          createStore.NODE_TYPE({network: Network.testnet, trial:false})
          createStore.STEP(1)
        },
        disabled: stdDisabled.value,
        disabledMsg: stdMsg
      }
    ])

    return {
      cards
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