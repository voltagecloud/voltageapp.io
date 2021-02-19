import { defineComponent, createElement, computed, reactive } from '@vue/composition-api'
import { nodeStore } from '~/store'
import { IDName } from '~/types/api'
import { VContainer, VRow, VCol, VCard, VCardTitle, VCardText, VCardActions,  VForm, VTextField, VAutocomplete, VBtn } from 'vuetify/lib'

const h = createElement


export default defineComponent({
  components: {
    VContainer, VRow, VCol, VCard, VCardTitle, VCardText, VCardActions, VForm, VTextField, VAutocomplete, VBtn
  },
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  setup: () => {
    const mainnetNodes = computed(() => nodeStore.user?.mainnet_nodes || [])
    console.log({ mainnetNodes })

    const state = reactive<{
      name: string;
      selectedNode: IDName|null;
      createKeys: boolean
      generateKeyDialog: boolean;
    }>({
      name: '',
      selectedNode: null,
      createKeys: true,
      generateKeyDialog: false
    })

    async function initStore() {
    }
    
    async function validateStore () {
      if (state.createKeys) {
        state.generateKeyDialog = true
      } else {
        await initStore()
      }
    }

    return () => <v-container>
      <v-row justify="center" align="start">
        <v-col cols="12" xl="8">
          <v-container>
            <v-card color="info">
              <v-card-title>
                <div class="mx-auto">Create BTCPay Server Store</div>
              </v-card-title>
              <v-card-actions>
                <v-form style="width: 100%;">
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          onInput={(val: string) => {state.name = val}}
                          value={state.name}
                          outlined
                          label="Store Name"
                          background-color="secondary"
                          color="highlight"
                        />
                      </v-col>
                      <v-col cols="12">
                        <v-autocomplete
                          onInput={(val: IDName) => {state.selectedNode = val }}
                          value={state.selectedNode?.node_name || ''}
                          items={mainnetNodes.value}
                          item-text="node_name"
                          item-value="node_id"
                          label="Select a Node"
                          color="highlight"
                          background-color="secondary"
                          outlined
                        />
                      </v-col>
                      <v-row>
                        <v-col cols="12">
                          <div class="ml-3">Bitcoin Keys</div>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-btn
                            block
                            onClick={() => { state.createKeys = true }}
                            dark={state.createKeys}
                            color={ state.createKeys ? 'highlight' : '' }
                          >
                            Generate keys for me
                          </v-btn>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-btn
                            block
                            onClick={() => { state.createKeys = false }}
                            dark={!state.createKeys}
                            color={ state.createKeys ? '' : 'highlight' }
                          >
                            I'll create my own
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-row>
                  </v-container>
                  <v-cotainer>
                    <v-btn onClick={validateStore}>Create Store</v-btn>
                  </v-cotainer>
                </v-form>
              </v-card-actions>
            </v-card>
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  }
})

