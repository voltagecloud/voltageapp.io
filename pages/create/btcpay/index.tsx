import { defineComponent, createElement, computed, reactive, ref } from '@vue/composition-api'
import { nodeStore } from '~/store'
import { VContainer, VRow, VCol, VCard, VCardTitle, VCardText, VCardActions,  VForm, VTextField, VAutocomplete, VBtn, VIcon, VDialog } from 'vuetify/lib'
import SetupBtcPay from '~/components/SetupBtcPay'
import CreateBTCWallet from '~/components/CreateBTCWallet'
import { macaroonStore } from '~/store'
import { voltageFetch } from '~/utils/fetchClient'

const h = createElement

interface WalletPayload {
  xPub: string;
  accountKeyPath: string;
  seedBackup?: string;
}

export default defineComponent({
  components: {
    VContainer, VRow, VCol, VCard, VCardTitle, VCardText, VCardActions, VForm, VTextField, VAutocomplete, VBtn, VIcon, VDialog
  },
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  // @ts-ignore
  setup: (_, { refs, root }) => {
    const mainnetNodes = computed(() => nodeStore.user?.mainnet_nodes || [])
    console.log({ mainnetNodes })

    // keypath used to generate addresses
    const state = reactive<{
      name: string;
      selectedNode: string;
      createKeys: null|'generate'|'useown';
      currentStep: number;
      walletPayload: null|WalletPayload;
      error: string;
      loading: boolean;
    }>({
      name: '',
      selectedNode: '',
      createKeys: null,
      currentStep: 0,
      walletPayload: null,
      error: '',
      loading: false
    })

    async function validateForm () {
      // return if form is not valid
      const formValid = refs.form.validate()
      console.log({ formValid })
      // make sure form is valid and a key method is selected & valid
      const keysValid = (state.createKeys === 'generate' && state.walletPayload) || state.createKeys === 'useown'
      if (!formValid || !keysValid) return
      // if there is a selected node get the macaroon
      if (state.selectedNode) {
        state.currentStep = 1
      } else {
        await createBtcPay()
      }
    }

    async function createBtcPay () {
      state.loading = true
      const nodeId = state.selectedNode
      const { macaroon } = macaroonStore.macaroonState({ nodeId, type: 'btcpayserver' })
      const payload = {
        node_id: nodeId || undefined,
        node_macaroon: macaroon,
        store_name: state.name,
        derivation_scheme: state.walletPayload?.xPub,
        account_key_path: state.walletPayload?.accountKeyPath,
        bitcoin_seed_backup: state.walletPayload?.seedBackup
      }

      const res = await voltageFetch('/btcpayserver/create', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      const json = await res.json()
      state.loading = false
      console.log({ json })
      if (!res.ok) {
        state.error = json.message
      } else {
        root.$router.push(`/btcpay/${json.btcpayserver_id}`)
      }
    }

    return () => <v-container>
      <v-row justify="center" align="start">
        <v-col cols="12" xl="8">
          <v-container>
            <v-card color="info" key="0">
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
                          clearable
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
                              onClick={() => {state.createKeys = 'generate'}}
                              dark={state.createKeys === 'generate'}
                              color={ state.createKeys === 'generate' ? 'highlight' : '' }
                            >
                              Generate keys for me
                            </v-btn>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-btn
                              block
                              onClick={() => { state.createKeys = 'useown'; state.walletPayload = null; }}
                              dark={state.createKeys === 'useown' }
                              color={ state.createKeys === 'useown' ? 'highlight' : '' }
                            >
                              I'll create my own
                            </v-btn>
                          </v-col>
                        </v-row>
                        { /* generate seed step */ }
                        <v-dialog value={state.createKeys === 'generate' && !state.walletPayload} onInput={() => state.createKeys = null}>
                          <v-card>
                            <v-card-actions>
                              <v-btn icon onClick={() => state.createKeys = null}>
                                <v-icon>mdi-close</v-icon>
                              </v-btn>
                            </v-card-actions>
                            <CreateBTCWallet onFinalize={(payload: WalletPayload) => state.walletPayload = payload } />
                          </v-card>
                        </v-dialog>
                      </v-container>
                    </v-row>
                  </v-container>
                  <v-container>
                    <v-btn onClick={validateForm} loading={state.loading}>Create Store</v-btn>
                    <div>{state.error}</div>
                  </v-container>
                </v-form>
              </v-card-actions>
            </v-card>
            { /* acquire macaroon step */}
            <v-dialog value={state.currentStep === 1}>
              <v-card color="info">
                <v-card-actions>
                  <v-btn onClick={() => { state.currentStep = 0}} icon>
                    <v-icon>mdi-arrow-left</v-icon>
                  </v-btn>
                </v-card-actions>
                <v-card-text>
                  <SetupBtcPay onDone={createBtcPay} nodeId={state.selectedNode} />
                </v-card-text>
              </v-card>
            </v-dialog>
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  }
})

