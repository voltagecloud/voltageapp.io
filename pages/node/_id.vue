<template>
  <v-container>
    <v-row>
      <v-col>
        <v-fade-transition>
          <material-card v-if="node">
            <template v-slot:heading>
              <h2 class="text-uppercase font-weight-light">
                {{ node.node_name }} -- {{ node.network }}
              </h2>
            </template>
            <template v:slot:after-heading>
              <v-container>
                <v-row>
                  <v-col
                    cols="12"
                    md="8"
                    class="py-0"
                  >
                    <v-list
                      flat
                      dense
                      class="py-0"
                    >
                      <v-list-item >
                        Status: {{ node.status }}
                      </v-list-item>
                      <v-list-item>
                        Public key: {{ node.public_key }}
                      </v-list-item>
                      <v-list-item>
                        Tor Address: {{ node.onion_address }}
                      </v-list-item>
                      <v-list-item>
                        Created: {{ node.creation_date }}
                      </v-list-item>
                      <v-list-item v-if="isTestnet">
                        Expires: {{ node.expires }}
                      </v-list-item>
                      <v-list-item>
                        API Endpoint: {{ node.api_endpoint }}
                      </v-list-item>
                    </v-list>
                  </v-col>
                  <v-col>
                    <v-row justify="start" justify-md="center" class="pl-6 pl-md-0">
                      <div>
                        <v-switch
                          v-model="autopilot"
                          label="autopilot"
                          inset
                          color="highlight"
                        ></v-switch>
                        <v-switch
                          v-model="grpc"
                          label="grpc"
                          inset
                          color="highlight"
                        ></v-switch>
                        <v-switch
                          v-model="rest"
                          label="rest"
                          inset
                          color="highlight"
                        ></v-switch>
                        <v-switch
                          v-model="tor"
                          label="tor"
                          inset
                          color="highlight"
                        ></v-switch>
                      </div>
                    </v-row>
                  </v-col>
                </v-row>
              </v-container>
            </template>
            <template v-slot:actions>
              <v-container>
                <v-btn
                  @click="update"
                  color="accent"
                  class="warning--text"
                  :loading="loading"
                >Save settings</v-btn>
              </v-container>
            </template>
          </material-card>
        </v-fade-transition>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { defineComponent, ref, computed, set } from '@vue/composition-api'
import { Context } from '@nuxt/types'
import { layoutStore, createStore, nodeStore } from '~/store'
import useNodeApi from '~/compositions/useNodeApi'


export default defineComponent({
  middleware: ['assertAuthed', 'loadNodes'],
  async fetch (context: Context) {
    const { postNode } = useNodeApi(context)
    const nodeData = await postNode(context.params.id)
    layoutStore.SET_TITLE(nodeData['node_name']?.toUpperCase())
  },
  components: {
    MaterialCard: () => import('~/components/core/MaterialCard.vue')
  },
  setup (_, { root }) {
    const nodeID = root.$nuxt.context.params.id
    const { updateSettings } = useNodeApi(root.$nuxt.context)
    const loading = ref(false)

    const settings = computed(() => createStore.settings)

    // init computed setters for state
    const autopilot = computed({
      get: () => settings.value.autopilot,
      set: (autopilot: Boolean) => createStore.SETTINGS({...settings.value, autopilot})
    })

    const grpc = computed({
      get: () => settings.value.grpc,
      set: (grpc: Boolean) => createStore.SETTINGS({...settings.value, grpc})
    })

    const rest = computed({
      get: () => settings.value.rest,
      set: (rest: Boolean) => createStore.SETTINGS({...settings.value, rest})
    })

    const tor = computed({
      get: () => settings.value.tor,
      set: (tor: Boolean) => createStore.SETTINGS({...settings.value, tor})
    })

    const node = computed(() => nodeStore.nodes.filter(elem => elem.node_id === nodeID)[0])

    const isTestnet = computed(() => node.value.network === 'testnet')

    async function update() {
      loading.value = true
      await updateSettings(nodeID, settings.value)
      loading.value = false
    }

    return {
      loading,
      autopilot,
      grpc,
      rest,
      tor,
      node,
      isTestnet,
      update
    }
  }
})
</script>
