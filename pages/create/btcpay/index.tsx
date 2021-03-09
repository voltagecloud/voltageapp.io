import { defineComponent, computed, reactive  } from '@vue/composition-api'
import { nodeStore, authStore } from '~/store'
import { VContainer, VRow, VCol, VCard, VCardTitle, VCardText, VCardActions,  VForm, VTextField, VAutocomplete, VBtn, VIcon, VDialog } from 'vuetify/lib'
import SetupBtcPay from '~/components/SetupBtcPay'
import CreateBTCWallet from '~/components/CreateBTCWallet'
import { macaroonStore } from '~/store'
import { voltageFetch } from '~/utils/fetchClient'
import CopyPill from '~/components/core/CopyPill.vue'
import useFetch from '~/compositions/useFetch'


interface WalletPayload {
  xPub: string;
  accountKeyPath: string;
  seedBackup?: string;
}

export default defineComponent({
  components: {
    VContainer, VRow, VCol, VCard, VCardTitle, VCardText, VCardActions, VForm, VTextField, VAutocomplete, VBtn, VIcon, VDialog, CopyPill
  },
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  // @ts-ignore
  setup: (_, { refs, root }) => {
    const mainnetNodes = computed(() => nodeStore.user?.mainnet_nodes || [])

    //make sure the user has btcpay servers
    const { dispatch, data, loading: serverLoading } = useFetch<{btcpayservers: any[]}>('/btcpayserver')
    dispatch({method: 'GET'})

    const {dispatch: userDispatch, data: userData, loading: userLoading} = useFetch<{
      available_btcpayservers: number;
      btcpayserver_trial: boolean;
    }>('/user')
    userDispatch({method: 'GET'})

    const loading = computed(() => serverLoading.value || userLoading.value)

    const canCreate = computed(() => {
      if (loading.value || !data.value || !userData.value) return false
      return data.value.btcpayservers.length === 0 &&
        (userData.value.available_btcpayservers || userData.value.btcpayserver_trial)
    })

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
      loading: false,
    })

    async function validateForm () {
      // return if form is not valid
      const form = refs.form as HTMLFormElement
      const formValid = form.validate()
      if (!formValid ) return
      const keysValid = (state.createKeys === 'generate' && state.walletPayload) || state.createKeys === 'useown'

      // make sure form is valid and a key method is selected & valid
      if (!keysValid) {
        state.error = 'You must select a key generation method'
        return
      }

      // if there is a selected node get the macaroon
      await createBtcPay()
    }

    const btcpayState = reactive({
      password: '',
      url: '',
      instanceId: ''
    })

    async function createBtcPay () {
      state.currentStep = 0
      const nodeId = state.selectedNode
      const { macaroonHex } = macaroonStore.macaroonState({ nodeId, type: 'btcpayserver' })
      if (!macaroonHex && state.selectedNode) {
        state.currentStep = 1
        return
      }
      state.loading = true
      const payload = {
        node_id: nodeId || undefined,
        node_macaroon: macaroonHex || undefined,
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
      if (!res.ok) {
        state.error = json.message
      } else {
        btcpayState.password = json.password
        btcpayState.url = json.url
        btcpayState.instanceId = json.btcpayserver_id
        state.currentStep = 2
      }
    }

    // aws amplify typescript typings are incorrect smh jeff bezos
    // @ts-ignore
    const username = computed(() => authStore?.user?.attributes?.email || '')

    // function to call when user is done creating and should leave this page
    function finish () {
      window.open(`https://${btcpayState.url}`, '_blank')
      root.$router.push(`/btcpay/${btcpayState.instanceId}`)
    }

    return () => <v-container>
      <v-row justify="center" align="start">
        <v-col cols="12" xl="8">
          <v-container>
            <v-card color="info" key="0">
              <v-card-title>
                <div class="mx-auto" style="word-break: normal;">Create BTCPay Server Store</div>
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
                          onInput={(val: string) => {state.selectedNode = val}}
                          value={state.selectedNode || ''}
                          items={mainnetNodes.value}
                          item-text="node_name"
                          item-value="node_id"
                          label="Select a Node"
                          color="highlight"
                          background-color="secondary"
                          no-data-text="You don't have any mainnet nodes running."
                          outlined
                          clearable
                        />
                      </v-col>
                      <v-container>
                        <v-row>
                          <v-col cols="12">
                            <div class="ml-3">Create a Bitcoin wallet for your store:</div>
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
                        <v-dialog max-width="800" value={state.createKeys === 'generate' && !state.walletPayload} onInput={() => state.createKeys = null}>
                          <v-card>
                            <v-card-actions>
                              <v-btn icon onClick={() => state.createKeys = null}>
                                <v-icon>mdi-close</v-icon>
                              </v-btn>
                            </v-card-actions>
                            <keep-alive>
                              <CreateBTCWallet onFinalize={(payload: WalletPayload) => state.walletPayload = payload } />
                            </keep-alive>
                          </v-card>
                        </v-dialog>
                      </v-container>
                    </v-row>
                  </v-container>
                  <v-container>
                    <v-btn
                      onClick={validateForm}
                      loading={state.loading || loading.value}
                      color="highlight"
                      dark
                      disabled={!canCreate.value}
                    >
                      Create Store
                    </v-btn>
                    <div class="error--text">{state.error}</div>
                    <div class="error--text">
                      {(!canCreate.value && !loading.value) ? `You don't have any available btcpay server accounts` : ''}
                    </div>
                  </v-container>
                </v-form>
              </v-card-actions>
            </v-card>
            { /* acquire macaroon step */}
            <v-dialog value={state.currentStep === 1} max-width="800">
              <v-card>
                <v-card-actions>
                  <v-btn onClick={() => { state.currentStep = 0}} icon>
                    <v-icon>mdi-arrow-left</v-icon>
                  </v-btn>
                </v-card-actions>
                <v-card-text>
                  {state.selectedNode && <SetupBtcPay onDone={createBtcPay} nodeId={state.selectedNode} />}
                </v-card-text>
              </v-card>
            </v-dialog>
            { /* finished dialog info */}
            <v-dialog value={state.currentStep === 2} max-width="800" persistent>
              <v-card class="text-center">
                <v-container>
                  <div class="text-h4">BTCPay Server Account Created!</div>
                  <div class="text-h6">Your BTCPay Server Account has successfully been created.</div>
                  <v-row class="my-4">
                    <v-col cols="12" class="font-weight-bold">Login Information:</v-col>
                    <v-col cols="12">Username: <copy-pill text={username.value} /></v-col>
                    <v-col cols="12">Password: <copy-pill text={btcpayState.password} /></v-col>
                  </v-row>
                  <div class="my-4 font-italic">Please change the default password as soon as you login</div>
                  <v-btn color="highlight" dark large onClick={finish}>Login to Account</v-btn>
                </v-container>
              </v-card>
            </v-dialog>
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  }
})

