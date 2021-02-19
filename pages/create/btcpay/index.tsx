import { defineComponent, createElement, computed, reactive } from '@vue/composition-api'
import { nodeStore } from '~/store'
import { IDName } from '~/store/api'

const h = createElement


export default defineComponent({
  setup: () => {
    const mainnetNodes = computed(() => nodeStore.user?.mainnet_nodes || [])

    const state = reactive<{
      name: string;
      selectedNode: IDName|null;
      createKeys: boolean
    }>({
      name: '',
      selectedNode: null,
      createKeys: true
    })

    return () => <v-container>
      <v-row justify="center" align="start">
        <v-col cols="12" xl="8">
          <v-container>
            <v-card color="info">
              <v-card-title>
                <div class="mx-auto">Create BTCPay Server Store</div>
              </v-card-title>
              <v-card-actions>
                <v-form>
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          onInput={(val: string) => {state.name = val}}
                          value={state.name}
                          outline
                          background-color="info"
                        />
                      </v-col>
                      <v-col cols="12">
                        <v-autocomplete
                          onInput={(val: IDName) => {state.selectedNode = val }}
                          value={state.selectedNode.name}
                          items={mainnetNodes.value}
                          label="Select a Node"
                        />
                      </v-col>
                    </v-row>
                  </v-container>
                </v-form>
              </v-card-actions>
            </v-card>
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  }
})

