import { defineComponent, createElement, computed, reactive, ref } from '@vue/composition-api'
import { nodeStore } from '~/store'
import { IDName } from '~/types/api'
import { VContainer, VRow, VCol, VCard, VCardTitle, VCardText, VCardActions,  VForm, VTextField, VAutocomplete, VBtn, VIcon } from 'vuetify/lib'
import SetupBtcPay from '~/components/SetupBtcPay'
import ConfirmSeed from '~/components/ConfirmSeed'

const h = createElement


export default defineComponent({
  components: {
    VContainer, VRow, VCol, VCard, VCardTitle, VCardText, VCardActions, VForm, VTextField, VAutocomplete, VBtn, VIcon
  },
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  setup: () => {
    // form ref 
    const form = ref<HTMLFormElement|null>(null)
    const mainnetNodes = computed(() => nodeStore.user?.mainnet_nodes || [])
    console.log({ mainnetNodes })

    // keypath used to generate addresses
    const accountKeyPath = `m/84'/0'/0'`
    const state = reactive<{
      name: string;
      selectedNode: IDName|null;
      createKeys: boolean
      currentStep: number
    }>({
      name: '',
      selectedNode: null,
      createKeys: true,
      currentStep: 0
    })

    async function initStore() {
      
    }
    
    async function validateStore () {
      // return if form is not valid
      if (!form.value?.validate()) return

      // if we need to create keys, move to next step
      if (state.createKeys) {
        state.currentStep = 1
      // else send the creation request
      } else {
        await initStore()
      }
    }

    return () => <v-container>
      <v-row justify="center" align="start">
        <v-col cols="12" xl="8">
          <v-container>
            { state.currentStep === 0 && <v-card color="info" key="0">
              <v-card-title>
                <div class="mx-auto">Create BTCPay Server Store</div>
              </v-card-title>
              <v-card-actions>
                <v-form style="width: 100%;"
                  ref={form}
                  lazy-validation
                >
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
                          rules={[
                            (val: string) => !!val || 'Your store must have a name'
                          ]}
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
                          rules={[
                            (val: IDName) => !!val.node_id || 'You must select a node'
                          ]}
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
                  <v-container>
                    <v-btn onClick={validateStore}>Create Store</v-btn>
                  </v-container>
                </v-form>
              </v-card-actions>
            </v-card>}
            { /* generate seed step */}
            { state.selectedNode && state.currentStep === 1 && <v-card color="info" key="1">
              <v-card-actions>
                <v-btn onClick={() => { state.currentStep = 0}} icon>
                  <v-icon>mdi-back</v-icon>
                </v-btn>
              </v-card-actions>
              <v-card-text>
                <SetupBtcPay onDone={() => state.currentStep = 2} nodeId={state.selectedNode.node_id} />
              </v-card-text>
            </v-card>}
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  }
})

