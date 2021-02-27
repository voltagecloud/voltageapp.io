import { defineComponent, createElement, reactive, computed } from '@vue/composition-api'
import { voltageFetch } from '~/utils/fetchClient'
import useFetch from '~/compositions/useFetch'
import JsonTable, { JsonData } from '~/components/core/JsonTable'
import { VContainer, VRow, VCol, VCard, VTabs, VTab, VTabsItems, VTabItem, VBtn, VIcon, VProgressCircular, VDialog } from 'vuetify/lib'
import GetSeedBackup from '~/components/GetSeedBackup'
import UpdateBTCPayNode from '~/components/UpdateBTCPayNode'
import { authStore } from '~/store'

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
    CopyPill: () => import('~/components/core/CopyPill.vue')
  },
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  setup: (_, { root }) => {
    const { data, loading, dispatch } = useFetch<any>('/btcpayserver')

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
      promptNodePassword: false,
      updating: false
    })


    const tabs = ['Info', 'Update Lightning Node', 'Seed Backup']

    async function deleteStore () {
      state.error = ''
      const res = await voltageFetch('/btcpayserver/delete', {
        method: 'POST',
        body: JSON.stringify({
          btcpayserver_id: root.$route.params.id
        })
      })
      if (res.ok) {
        root.$router.push('/btcpay')
      } else {
        const { message } = await res.json()
        state.error = message
      }
    }

    async function handleUpdate () {
      await load()
      state.tab = 0
    }


    // @ts-ignore
    const username = computed(() => authStore?.user?.attributes?.email || '')
    const fullUrl = computed(() => `https://${data.value?.url}`)

    const tableData = () => {
      const d = data.value
      return {
        Status: d.status,
        'Purchase Status': d.purchase_status,
        'Node Name': d.node_name || 'No Node Attached',
        Created: d.created,
        Expires: d.expires,
        Instance: d.instance,
        'Store Name': d.store_name,
        URL: fullUrl.value,
        Username: `${username.value}`
      } as JsonData
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
              show-arrows
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
                  <v-btn icon target="_blank" href={fullUrl.value}>
                    <v-icon>mdi-open-in-app</v-icon>
                  </v-btn>
                  { data.value?.purchase_status === 'trial' && <v-btn icon to="/purchase">
                    <v-icon>
                      mdi-currency-usd
                    </v-icon>
                  </v-btn>}
                  <v-btn icon onClick={deleteStore}>
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-container>
                {state.error && <div class="error--text info text-right px-3">{state.error}</div>}
                <v-tab-item>
                  <JsonTable data={tableData} >
                    <tr>
                      <td>
                        Default Password
                      </td>
                      <td>
                        <copy-pill text={data.value.password} hide color="accent" text-color="warning"/>
                      </td>
                    </tr>
                  </JsonTable>
                </v-tab-item>
                <v-tab-item>
                  { data.value && <UpdateBTCPayNode onDone={handleUpdate} server={data.value} />}
                </v-tab-item>
                <v-tab-item>
                  <GetSeedBackup serverId={root.$route.params.id}/>
                </v-tab-item>
              </v-tabs-items>
            }
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  }
})

