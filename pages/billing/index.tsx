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

    const renderPurchasedNodes = ({ title, match, items }: { title: string; match: string; items: any[] }) => {
      const purchased = items.reduce((acc: number, cur: any) => {
        return cur.item === match ? cur.quantity + acc : acc
      }, 0)
      if (purchased) {
        return <tr>
          <td><b>{title}</b></td>
          <td>{purchased}</td>
        </tr>
      }
    }

    return () => <v-container>
      <v-row justify="center">
        <v-col cols="12" lg="10">
          { state.error && <v-card class="pa-3 text-h4">{state.error}</v-card> }
          { state.data && state.data.status !== 'active' && <v-card class="pa-3 text-center">
            Warning, your account status is: { state.data.status }
          </v-card>}
          { state.data  && state.data.subscriptions.map((sub: any)  => <v-card color="info" class="pa-3 my-3" >
            <v-simple-table
              style={{'background-color': ctx.root.$vuetify.theme.currentTheme.secondary}}
            >
              <tbody>
                <tr>
                  <td><b>Status</b></td>
                  <td>{sub.status}</td>
                </tr>
                <tr>
                  <td><b>Method</b></td>
                  <td>{sub.payment_method}</td>
                </tr>
                <tr>
                  <td><b>Billing Interval</b></td>
                  <td>{sub.interval}</td>
                </tr>
                <tr>
                  <td><b>Price</b></td>
                  <td>{sub.price}</td>
                </tr>
                <tr>
                  <td><b>Renewal Date</b></td>
                  <td>{sub.renewal_date}</td>
                </tr>
                <tr>
                  <td><b>Renewal Type</b></td>
                  <td>{sub.renewal_type}</td>
                </tr>
                {renderPurchasedNodes({
                  title: 'Standard Nodes',
                  match: 'standard_node',
                  items: sub.items
                })}
                {renderPurchasedNodes({
                  title: 'Lite Nodes',
                  match: 'lite_node',
                  items: sub.items
                })}
                <tr>
                  <td><b>Linked Items</b></td>
                  <td>{renderLinkedNodes([...sub.lite_nodes, ...sub.nodes])}</td>
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


