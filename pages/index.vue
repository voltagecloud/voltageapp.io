<template lang="pug">
  v-container(cols="12" lg="8")
    v-row(justify="center" align="center")
      v-col(cols="12" md="6" lg="5")
        available-node(network="testnet")
      v-col(cols="12" md="6" lg="5")
        available-node(network="mainnet")
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { layoutStore } from '~/store'

export default defineComponent({
    middleware: ['assertAuthed', 'loadUser'],
    components: {
        AvailableNode: () => import('~/components/AvailableNode.vue')
    },
    setup () {
      layoutStore.SET_TITLE('Dashboard')
      layoutStore.DRAWER(null)
    }
})
</script>
