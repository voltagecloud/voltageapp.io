<template>
  <v-card
    shaped
    color="info"
  >
    <v-card-title
      class="font-weight-light warning--text"
    >
      {{ capitalized }}
    </v-card-title>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="6">
          <v-row justify="center">
            <v-col
              cols="12"
              class="text-center display-3 warning--text font-weight-medium"
              :class="{ 'text--darken-1': !dark, 'text--lighten-3': !light }"
            >
              {{ available }}
            </v-col>
            <v-col
              cols="12"
              class="text-center caption font-italic font-weight-light"
            >
              Available {{ capitalized }} Nodes
            </v-col>
            <v-col cols="12" class="text-center">
              <v-btn
                color="accent"
                class="mx-auto"
                :class="{ 'warning--text text--darken-1': available }"
                :disabled="!available"
                @click="setupNode"
              >
                Create New Node
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" sm="6">
          <v-row justify="center">
            <v-col
              cols="12"
              class="text-center display-3 warning--text font-weight-medium"
              :class="{ 'text--darken-1': !dark, 'text--lighten-3': !light }"
            >
              {{ numNodes }}
            </v-col>
            <v-col
              cols="12"
              class="text-center caption font-italic font-weight-light"
            >
              Running {{ capitalized }} Nodes
            </v-col>
            <v-col cols="12" class="text-center">
              <v-btn
                color="accent"
                class="mx-auto"
                :class="{'warning--text text--darken-1': numNodes > 0}"
                :disabled="numNodes === 0"
              >
                Manage Nodes
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>
<script>
import { defineComponent, computed } from '@vue/composition-api'
import { createStore, nodeStore } from '~/store'

export default defineComponent({
  props: {
    network: {
      type: String,
      required: true
    },
    light: {
      type: Boolean,
      default: false
    },
    dark: {
      type: Boolean,
      default: false
    }
  },
  setup (props, {root: { $router }}) {
    function setupNode () {
      createStore.SEED([])
      createStore.NETWORK(props.network)
      $router.push('/create')
    }

    const capitalized = computed(() => props.network.charAt(0).toUpperCase() + props.network.slice(1))

    const numNodes = computed(() => nodeStore[`${props.network}Nodes`].length)

    const available = computed(() => nodeStore[`${props.network}Available`])

    const purchased = computed(() => nodeStore.purchased)

    return {
      setupNode,
      capitalized,
      numNodes,
      available,
      purchased
    }
  }
})
</script>
