import { defineComponent, createElement, computed, reactive, ref } from '@vue/composition-api'
import { nodeStore } from '~/store'
import { VContainer, VRow, VCol, VCard, VCardTitle, VCardText, VCardActions,  VForm, VTextField, VAutocomplete, VBtn, VIcon } from 'vuetify/lib'
import SetupBtcPay from '~/components/SetupBtcPay'
import CreateBTCWallet from '~/components/CreateBTCWallet'
import { macaroonStore } from '~/store'
import { voltageFetch } from '~/utils/fetchClient'

const h = createElement


export default defineComponent({
  components: {
    VContainer, VRow, VCol, VCard, VCardTitle, VCardText, VCardActions, VForm, VTextField, VAutocomplete, VBtn, VIcon
  },
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  // @ts-ignore
  setup: (_, { refs }) => {
    // form ref 
    const mainnetNodes = computed(() => nodeStore.user?.mainnet_nodes || [])
    console.log({ mainnetNodes })

    // keypath used to generate addresses
    const state = reactive<{
      name: string;
      selectedNode: string;
      createKeys: boolean
      currentStep: number
    }>({
      name: '',
      selectedNode: '',
      createKeys: true,
      currentStep: 0
    })

    function validateForm () {
      // return if form is not valid
      const formValid = refs.form.validate()
      console.log({ formValid })
      if (!formValid) return
      state.currentStep = 1
    }

    async function handleMacaroon () {
      if (state.createKeys) {
        state.currentStep = 2
      } else {
        // user has opted out of wallet generation
        // create store without details
        await createBtcPay({})
      }
    }

    async function createBtcPay (
      { xPub, accountKeyPath, seedBackup }:
      { xPub?: string; accountKeyPath?: string; seedBackup?: string; }
    ) {
      const nodeId = state.selectedNode
      const { macaroon } = macaroonStore.macaroonState({ nodeId, type: 'btcpayserver' })
      const payload = {
        node_id: nodeId,
        node_macaroon: macaroon,
        store_name: state.name,
        derivation_scheme: xPub,
        account_key_path: accountKeyPath,
        bitcoin_seed_backup: seedBackup
      }

      const res = await voltageFetch('/btcpayserver/create', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      const json = await res.json()
      console.log({ json })

      window.open(json.url, '_blank')
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
                  ref="form"
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
                          onInput={(val: string) => {state.selectedNode = val }}
                          value={state.selectedNode || ''}
                          items={mainnetNodes.value}
                          item-text="node_name"
                          item-value="node_id"
                          label="Select a Node"
                          color="highlight"
                          background-color="secondary"
                          outlined
                          rules={[
                            (nodeId: string) => {
                              return !!nodeId || 'You must select a node'
                            }
                          ]}
                        />
                      </v-col>
                      <v-container>
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
                      </v-container>
                    </v-row>
                  </v-container>
                  <v-container>
                    <v-btn onClick={validateForm}>Create Store</v-btn>
                  </v-container>
                </v-form>
              </v-card-actions>
            </v-card>}
            { /* acquire macaroon step */}
            { state.selectedNode && state.currentStep === 1 && <v-card color="info" key="1">
              <v-card-actions>
                <v-btn onClick={() => { state.currentStep = 0}} icon>
                  <v-icon>mdi-back</v-icon>
                </v-btn>
              </v-card-actions>
              <v-card-text>
                <SetupBtcPay onDone={handleMacaroon} nodeId={state.selectedNode} />
              </v-card-text>
            </v-card>}
            { /* generate seed step */ }
            { state.currentStep === 2 && <v-card color="info" key="2">
              <div>wallet</div>
              <CreateBTCWallet onFinalize={createBtcPay} />
            </v-card>}
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  }
})

