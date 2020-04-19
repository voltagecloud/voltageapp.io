<template lang="pug">
  v-container
    v-row
      v-col
        v-fade-transition
          material-card(v-if='node')
            template(v-slot:heading)
              h2.text-uppercase.font-weight-light
                | {{ node.node_name }} -- {{ node.network }}
            template(v:slot:after-heading)
              v-container
                v-row
                  v-col.py-0(cols='12' md='8')
                    v-list.py-0(flat dense)
                      v-list-item
                        | Status:&nbsp;
                        copy-pill(
                          color="accent"
                          text-color="warning"
                          :text="node.status"
                        )
                      v-list-item
                        | Public key:&nbsp; 
                        copy-pill(
                          color="accent"
                          text-color="warning"
                          :text="node.public_key"
                        )
                      v-list-item
                        | Tor Address:&nbsp;
                        copy-pill(
                          color="accent"
                          text-color="warning"
                          :text="node.onion_address"
                        )
                      v-list-item
                        | Created:&nbsp;
                        copy-pill(
                          color="accent"
                          text-color="warning"
                          :text="node.creation_date"
                        )
                      v-list-item(v-if='isTestnet')
                        | Expires:&nbsp;
                        copy-pill(
                          color="accent"
                          text-color="warning"
                          :text="node.expires"
                        )
                      v-list-item
                        | API Endpoint:&nbsp;
                        copy-pill(
                          color="accent"
                          text-color="warning"
                          :text="node.api_endpoint"
                        )
                  v-col
                    v-row.pl-6.pl-md-0(justify='start' justify-md='center')
                      div
                        v-switch(v-model='autopilot' label='Autopilot' inset='' color='highlight')
                        v-switch(v-model='grpc' label='GRPC' inset color='highlight')
                        v-switch(v-model='rest' label='REST' inset color='highlight')
                        v-switch(v-model='tor' label='Tor' inset color='highlight')
                        v-switch(v-model='keysend' label="Keysend" inset color='highlight')
                  v-col(cols="12")
                    v-combobox(v-model='whitelist' chips label='Whitelist' multiple outlined color='highlight')
                      template(v-slot:selection='{ attrs, item, select, selected }')
                        v-chip(v-bind='attrs' :input-value='selected' close='' @click='select' @click:close='remove(item)')
                          | {{ item }}
            template(v-slot:actions)
              v-container
                v-row(justify="space-between")
                  v-btn.warning--text(@click='updateSettings(nodeID, settings)' color='accent' :loading='loading') Save settings
                  v-dialog(width="500" v-model="showDialog")
                    template(v-slot:activator="{ on }")
                      v-btn(v-on="on" color="red") Delete Node
                    v-card(v-if="node.status !== 'deleted'")
                      v-card-title
                        | Delete Node
                      v-card-text.pb-0
                        | Are you sure you wish to delete this node? This action cannot be undone, however you will still be able to export node data. 
                        span.font-weight-bold
                          | {{ node.node_name }} 
                        | to confirm
                      v-card-actions
                        v-row
                          v-col(cols='12')
                            v-text-field(v-model="confirm" :placeholder="node.node_name").mx-5
                          v-col(cols='12')
                            v-btn(:disabled="confirm !== node.node_name" @click="delNode" color='red').ml-5 Delete
                    v-card(v-else)
                      v-card-title
                        | Delete Node
                      v-card-text
                        | This node has already been deleted
                      v-card-actions
                        v-btn(@click="showDialog = false" color="accent").ml-5.warning--text Dismiss


</template>
<script lang="ts">
import { defineComponent, ref, computed, set } from '@vue/composition-api'
import { Context } from '@nuxt/types'
import { layoutStore, createStore, nodeStore } from '~/store'
import useNodeApi from '~/compositions/useNodeApi'
import { Address4, Address6 } from 'ip-address'


export default defineComponent({
  middleware: ['assertAuthed', 'loadNodes'],
  async fetch (context: Context) {
    const { postNode, deleteNode } = useNodeApi(context)
    const nodeData = await postNode(context.params.id)
    layoutStore.SET_TITLE(nodeData['node_name']?.toUpperCase())
  },
  components: {
    MaterialCard: () => import('~/components/core/MaterialCard.vue'),
    CopyPill: () => import('~/components/core/CopyPill.vue')
  },
  setup (_, { root }) {
    const nodeID = ref(root.$nuxt.context.params.id)
    const { updateSettings, loading, deleteNode, postNode } = useNodeApi(root.$nuxt.context)

    const settings = computed(() => createStore.settings)


    // init computed setters for state
    const autopilot = computed({
      get: () => settings.value.autopilot,
      set: (autopilot: Boolean) => createStore.SETTINGS({...settings.value, autopilot})
    })

    const grpc = computed({
      get: () => settings.value.grpc,
      set: (grpc: Boolean) => createStore.SETTINGS({...settings.value, grpc})
    })

    const rest = computed({
      get: () => settings.value.rest,
      set: (rest: Boolean) => createStore.SETTINGS({...settings.value, rest})
    })

    const tor = computed({
      get: () => settings.value.tor,
      set: (tor: Boolean) => createStore.SETTINGS({...settings.value, tor})
    })

    const keysend = computed({
      get: () => settings.value.keysend,
      set: (keysend: Boolean) => createStore.SETTINGS({...settings.value, keysend})
    })

    const whitelist = computed({
      get: () => settings.value.whitelist,
      set: (whitelist: Array<Address4|Address6>) => createStore.SETTINGS({...settings.value, whitelist})
    })

    function remove (item: Address4|Address6) {
      whitelist.value = whitelist.value.filter(elem => elem !== item)
    }

    const node = computed(() => nodeStore.nodes.filter(elem => elem.node_id === nodeID.value)[0])

    const isTestnet = computed(() => node.value.network === 'testnet')

    const confirm = ref('')

    const showDialog = ref(false)

    async function delNode () {
      await deleteNode(node.value.node_id, node.value.network)
      showDialog.value = false
      await postNode(nodeID.value)
    }


    return {
      loading,
      autopilot,
      grpc,
      rest,
      tor,
      keysend,
      whitelist,
      node,
      isTestnet,
      updateSettings,
      settings,
      nodeID,
      remove,
      confirm,
      delNode,
      showDialog
    }
  }
})
</script>
