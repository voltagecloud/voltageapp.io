import { defineComponent, reactive, createElement } from '@vue/composition-api'
import useNodeApi from '~/compositions/useNodeApi'
import { VContainer, VRow, VCol, VCard, VSimpleTable, VChip, VBtn } from 'vuetify/lib'
import { nodeStore } from '~/store'

const h = createElement

export default defineComponent({
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  components: {
    VContainer, VRow, VCol, VCard, VSimpleTable, VChip, VBtn
  },
  setup: (_, ctx) => {

    const { billing, loading } = useNodeApi(ctx.root.$nuxt.context)

    const state = reactive({
      data: null as null|Record<string, any>,
      error: ''
    })

    billing().then(res => {
      if (!res) {
        state.error = 'an error occured fetching billing information'
        return 
      }
      state.data = res.data
      state.error = ''
    })

    const renderLinkedNodes = (ids: string[]) => {
      const linkedNodes = ids.reduce((acc: any, cur: any) => { 
        let nodeItem = null
        for (const node of nodeStore.IDNames) {
          if (node.node_id === cur) {
            nodeItem = <v-chip
              color="accent"
              text-color="warning"
              onClick={() => ctx.root.$router.push(`/node/${cur}`)}
            >
              {node.node_name}
            </v-chip>
            break
          }
        }
        return !!nodeItem ? [...acc, nodeItem] : acc
      }, [])
      return linkedNodes.length ? linkedNodes : <div>None</div>
    }

    return () => <v-container>
      <v-row justify="center">
        <v-col cols="12" lg="10">
          { state.error && <v-card class="pa-3 text-h4">{state.error}</v-card> }
          { state.data && state.data.status !== 'active' && <v-card class="pa-3">
            Warning: your account status is: { state.data.status }
          </v-card>}
          { state.data  && state.data.subscriptions.map((sub: any)  => <v-card color="info" class="pa-3 my-3" >
            <v-simple-table
              style={{'background-color': ctx.root.$vuetify.theme.currentTheme.secondary}}
            >
              <tbody>
                <tr>
                  <td>Status</td>
                  <td>{sub.status}</td>
                </tr>
                <tr>
                  <td>Method</td>
                  <td>{sub.payment_method}</td>
                </tr>
                <tr>
                  <td>Billing Interval</td>
                  <td>{sub.interval}</td>
                </tr>
                <tr>
                  <td>Price</td>
                  <td>{sub.price}</td>
                </tr>
                <tr>
                  <td>Renewal Date</td>
                  <td>{sub.renewal_date}</td>
                </tr>
                <tr>
                  <td>Renewal Type</td>
                  <td>{sub.renewal_type}</td>
                </tr>
                <tr>
                  <td>Standard Nodes</td>
                  <td>{renderLinkedNodes(sub.nodes)}</td>
                </tr>
                <tr>
                  <td>Lite Nodes</td>
                  <td>{renderLinkedNodes(sub.lite_nodes)}</td>
                </tr>
              </tbody>
            </v-simple-table>
            <v-container class="pb-0">
              <v-row justify="end">
                <v-btn color="highlight" href={sub.payment_link} target="_blank" dark>Manage Subscription</v-btn>
              </v-row>
            </v-container>
          </v-card>)}
        </v-col>
      </v-row>
    </v-container>
  }
})


