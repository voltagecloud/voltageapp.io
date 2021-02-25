import { defineComponent, createElement, reactive, computed } from '@vue/composition-api'
import { voltageFetch } from '~/utils/fetchClient'
import useFetch from '~/compositions/useFetch'
import JsonTable from '~/components/core/JsonTable'
import { nodeStore, macaroonStore } from '~/store'
import { VContainer, VRow, VCol, VCard, VTabs, VTab, VTabsItems, VTabItem, VBtn, VIcon, VProgressCircular, VDialog, VAutocomplete } from 'vuetify/lib'
import GetSeedBackup from '~/components/GetSeedBackup'

const h = createElement

export default defineComponent({
  components: {
    VContainer,
    VRow,
    VCol,
    VCard,
    VTabs,
    VTab,
    VTabsItems,
    VTabItem,
    VBtn,
    VIcon,
    VProgressCircular,
    VDialog,
    VAutocomplete,
  },
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  setup: (_, { root }) => {
    const { data, loading, dispatch } = useFetch<any>('/btcpayserver')
    const mainnetNodes = computed(() => nodeStore.user?.mainnet_nodes || [])

    async function load () {
      await dispatch({
        method: 'POST',
        body: JSON.stringify({
          btcpayserver_id: root.$route.params.id
        })
      })
    }
    load()

    const state = reactive({
      tab: 0,
      error: '',
      newSelectedNode: '',
      promptNodePassword: false
    })

    const selectValue = computed(() => {
      const out = state.newSelectedNode || {
        node_name: data.value.node_name,
        node_id: data.value.node_id
      }
      console.log({ out })
      return out
    })

    const tabs = ['Info', 'Update Lightning Node', 'Seed Backup']

    async function deleteStore () {
      const res = await voltageFetch('/btcpayserver/delete', {
        method: 'POST',
        body: JSON.stringify({
          btcpayserver_id: root.$route.params.id
        })
      })
      if (res.ok) {
        root.$router.push('/btcpay')
      }
    }

    async function updateNode () {
      if (!state.newSelectedNode) return
      const { macaroon } = macaroonStore.macaroonState({
        nodeId: state.newSelectedNode,
        type: 'btcpayserver'
      })
      if (!macaroon) {
        state.promptNodePassword = true
        return
      }
      const res = await voltageFetch('/btcpayserver/update_node', {
        method: 'POST',
        body: JSON.stringify({
          btcpayserver_id: root.$route.params.id,
          node_id: state.newSelectedNode,
        })
      })
      if (res.ok) {
        await load()
        state.tab = 0
      }
    }

    async function handlePassword (password: string) {
      await macaroonStore.FETCH_MACAROON({
        nodeId: state.newSelectedNode,
        macaroonType: 'btcpayserver',
        password
      })
      const { error } = macaroonStore.macaroonState({
        nodeId: state.newSelectedNode,
        type: 'btcpayserver'
      })
      state.error = error
      if (!error) {
        state.promptNodePassword = false
      }
    }

    return () => <v-container>
      <v-row justify="center">
        <v-col cols="12" md="10" lg="9">
          <v-card color="info">
            <v-tabs
              value={state.tab}
              onChange={(v: number) => state.tab = v}
              background-color="transparent"
              grow
            >
              {tabs.map(t => <v-tab active-class="highlight">{t}</v-tab>)}
            </v-tabs>
            { loading.value
              ? <div class="d-flex justify-center">
                <v-progress-circular indeterminate />
              </div> 
              : <v-tabs-items value={state.tab}>
                <v-container class="d-flex info">
                  <div class="font-weight-light warning--text text--darken-1 text-h6 flex-grow-1 text-left d-flex align-center">
                    { data.value.store_name }
                  </div>
                  <v-btn icon onClick={deleteStore}>
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-container>
                <v-tab-item>
                  <JsonTable data={() => data.value} />
                </v-tab-item>
                <v-tab-item>
                  <v-container>
                    <v-row justify="center">
                      <v-col cols="8">
                        <v-autocomplete
                          onInput={(val: string) => {state.newSelectedNode = val }}
                          value={selectValue.value || ''}
                          items={mainnetNodes.value}
                          item-text="node_name"
                          item-value="node_id"
                          label="Select a Node"
                          color="highlight"
                          outlined
                          clearable
                        />
                      </v-col>
                      <v-col cols="8">
                        <v-btn onClick={updateNode} color="highlight" dark>
                          Update Connected Node
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-tab-item>
                <v-tab-item>
                  <GetSeedBackup serverId={root.$route.params.id}/>
                </v-tab-item>
              </v-tabs-items>
            }
          </v-card>
        </v-col>
      </v-row>
      <v-dialog value={state.promptNodePassword} onInput={(v: boolean) => state.promptNodePassword = v}>
        <node-password-input onDone={handlePassword} text="Authorize BTC Pay Server" />
      </v-dialog>
    </v-container>
  }
})

