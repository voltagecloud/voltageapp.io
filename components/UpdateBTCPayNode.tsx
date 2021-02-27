import { defineComponent, createElement, reactive, computed, PropType } from '@vue/composition-api'
import { nodeStore, macaroonStore } from '~/store'
import { voltageFetch } from '~/utils/fetchClient'
import { VContainer, VRow, VCol, VBtn, VDialog, VAutocomplete } from 'vuetify/lib'

const h = createElement

interface Props {
  node_name: string;
  node_id: string;
}

export default defineComponent({
  components: {
    VContainer,
    VRow,
    VCol,
    VBtn,
    VDialog,
    VAutocomplete,
    NodePasswordInput: () => import('~/components/NodePasswordInput.vue')
  },
  props: {
    server: {
      type: Object as PropType<Props>,
      required: true
    }
  },
  setup: (props, { root, emit }) => {
    const mainnetNodes = computed(() => nodeStore.user?.mainnet_nodes || [])

    const state = reactive({
      newSelectedNode: '',
      updating: false,
      promptNodePassword: false,
      macaroonError: '',
      updateError: '',
      changed: false
    })

    const selectValue = computed(() => {
      const out = state.newSelectedNode || {
        node_name: props.server.node_name,
        node_id: props.server.node_id
      }
      console.log({ out })
      return out
    })


    async function updateNode (mac?: string) {
      state.updateError = ''
      // if input hasnt changed return
      if (!state.changed) return
      let thisMacaroon = mac
      if (!thisMacaroon) {
        const { macaroon } = macaroonStore.macaroonState({
          nodeId: state.newSelectedNode,
          type: 'btcpayserver'
        })
        console.log({ macaroon })
        thisMacaroon = macaroon
      }
      // if there is a selected new node but its macaroon isnt present
      if (!thisMacaroon && state.newSelectedNode) {
        state.promptNodePassword = true
        return
      }
      state.updating = true
      const res = await voltageFetch('/btcpayserver/update_node', {
        method: 'POST',
        body: JSON.stringify({
          btcpayserver_id: root.$route.params.id,
          node_id: state.newSelectedNode || '',
          node_macaroon: thisMacaroon
        })
      })
      state.updating = false
      if (res.ok) {
        emit('done')
      } else {
        const { message } = await res.json()
        state.updateError = message
      }
    }

    async function handlePassword (password: string) {
      state.macaroonError = ''
      const fetchError = await macaroonStore.FETCH_MACAROON({
        nodeId: state.newSelectedNode,
        macaroonType: 'btcpayserver',
        password
      })
      if (fetchError) {
        state.macaroonError = fetchError
        return
      }
      const { error, macaroon } = macaroonStore.macaroonState({
        nodeId: state.newSelectedNode,
        type: 'btcpayserver'
      })
      console.log({ error })
      state.macaroonError = error

      if (macaroon) {
        state.promptNodePassword = false
        await updateNode(macaroon)
      }
    }

    return () => <v-container>
      <v-row justify="center">
        <v-col cols="8">
          <v-autocomplete
            onInput={(val: string) => {state.newSelectedNode = val; state.changed = true }}
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
          <v-btn loading={state.updating} onClick={() => updateNode()} color="highlight" dark error>
            Update Connected Node
          </v-btn>
          <div class="error--text">{state.updateError}</div>
        </v-col>
      </v-row>
      <v-dialog value={state.promptNodePassword} onInput={(v: boolean) => state.promptNodePassword = v}>
        <node-password-input onDone={handlePassword} text="Authorize BTCPay Server" error={state.macaroonError} />
      </v-dialog>
    </v-container>
  }
})

