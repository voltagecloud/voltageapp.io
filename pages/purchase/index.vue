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
                        v-btn.px-4.info--text(block='' @click='selectPlan' color='highlight' large='' :loading='loading')
                          | Buy Node
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
    const { getPurchaseSession } = useNodeApi(root.$nuxt.context)
    async function selectPlan() {
      console.log(root.$nuxt.context)
    }

    return {
      selectPlan
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
