<template>
  <v-container cols="12" lg="8">
    <v-row justify="center" align="center">
      <v-col cols="12" md="6" lg="5">
        <network-summary
          network="testnet"
        />
      </v-col>
      <v-col cols="12" md="6" lg="5">
        <network-summary
          network="mainnet"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { layoutStore } from '~/store'

export default defineComponent({
    middleware: ['assertAuthed', 'loadNodes'],
    components: {
        NetworkSummary: () => import('~/components/NetworkSummary.vue')
    },
    setup () {
      layoutStore.SET_TITLE('Dashboard')
    }
})
</script>
