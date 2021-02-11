import { Context } from '@nuxt/types'
import { ref } from '@vue/composition-api'
import { createStore, nodeStore, exportsStore, dashboardsStore } from '~/store'
import { Node, CreateNode, PopulateNode, NodeExport, NodeNameResponse } from '~/types/apiResponse'
import { Settings, Network, ExportData } from '~/types/api'

export default function useNodeApi ({ $axios, error }: Context) {
  const loading = ref(false)

  async function createNode () {
    loading.value = true
    try {
      const node = await $axios.post<CreateNode>(
        '/node/create',
        {
          network: createStore.network,
          purchased_type: createStore.trial ? 'trial' : 'paid',
          type: createStore.type
        }
      )
      await createStore.NEW_NODE_ID(node.data?.['node_id'])
      await createStore.AUTOFILL_WHITELIST(node.data?.['user_ip'])
      loading.value = false
      return node
    } catch (e) {
      loading.value = false
      throw e
    }
  }

  async function populateNode () {
    loading.value = true
    try {
      const node = await $axios.post<PopulateNode>(
        '/node/populate',
        {
          node_id: createStore.newNodeID,
          name: createStore.nodeName,
          // force sphinx creation as false for now
          settings: Object.assign(createStore.settings, { sphinx: false }) as Settings
        }
      )
      loading.value = false
      return node
    } catch (e) {
      loading.value = false
      throw e
    } finally {
      loading.value = false
    }
  }

  async function postNode (id:string) {
    loading.value = true
    const node = await $axios.post<Node>('/node', {
      node_id: id
    })
    nodeStore.ADD_NODE(node.data)
    createStore.HYDRATE_SETTINGS(node.data.settings)
    loading.value = false
    return node.data
  }

  async function updateSettings (id: string, backup: boolean, settings: Settings) {
    loading.value = true
    try {
      const res = await $axios.post('/node/settings', {
        node_id: id,
        macaroon_backup: backup,
        settings
      })
      nodeStore.UPDATE_NODE(res.data)
      loading.value = false
      return res
    } catch (e) {
      loading.value = false
      error({ statusCode: 500 })
    } finally {
      loading.value = false
    }
  }

  async function updateNode (id: string) {
    loading.value = true
    try {
      const res = await $axios.post('/node/update', {
        node_id: id
      })
      return res
    } catch (e) {
      loading.value = false
      error({ statusCode: 500 })
    } finally {
      loading.value = false
    }
  }

  async function updateTls (id: string) {
    try {
      const res = await $axios.post('/node/tls_update', {
        node_id: id
      })
      loading.value = false
      return res
    } catch (e) {
      loading.value = false
      error({ statusCode: 500 })
    } finally {
      loading.value = false
    }
  }

  async function startExport (id: string, exportData: ExportData) {
    loading.value = true
    try {
      const res = await $axios.post<NodeExport>('/export', {
        node_id: id,
        type: exportData
      })
      loading.value = false
      exportsStore.ADD_EXPORT(res.data)
      return res
    } catch (e) {
      loading.value = false
      error({ statusCode: 500 })
    } finally {
      loading.value = false
    }
  }

  async function nodeName (node_name: string, network: Network) {
    loading.value = true
    const res = await $axios.post<NodeNameResponse>('/node/name', {
      node_name,
      network
    })
    loading.value = false
    return res
  }

  async function updateStatus (node_id: string, status: string) {
    try {
      loading.value = true
      const res = await $axios.post('/node/status', {
        node_id,
        status
      })
      return res
    } catch (e) {
      console.log(e)
    } finally {
      loading.value = false
    }
  }

  async function postMacaroon (node_id: string, name: string, macaroon: string) {
    try {
      loading.value = true
      const res = await $axios.post('/node/macaroon', {
        node_id,
        name,
        macaroon
      })
      return res
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function connectNode (node_id: string, name: string) {
    try {
      loading.value = true
      const res = await $axios.post('/node/connect', {
        node_id,
        name
      })
      return res.data
    } catch (e) {
      const resp = e.response
      if (resp.status === 400 && resp.data.message === 'macaroon is invalid') {
        return {
          endpoint: '',
          tls_cert: '',
          macaroon: ''
        }
      } else {
        console.error(e)
      }
    } finally {
      loading.value = false
    }
  }

  async function getCert (node_id: string) {
    try {
      loading.value = true
      const res = await $axios.post('/node/cert', {
        node_id
      })
      return res.data
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function getSeed (node_id: string) {
    try {
      loading.value = true
      const res = await $axios.post('/node/seed', {
        node_id
      })
      return res.data
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function saveSeed (node_id: string, seed: string) {
    try {
      loading.value = true
      const res = await $axios.post('/node/seed', {
        node_id,
        seed
      })
      return res.data
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function getPurchaseSession (plan: string, quantity: string, email: string) {
    try {
      const res = await $axios.post('/stripe/session', {
        plan,
        quantity,
        email
      })
      return res
    } catch (e) {
      loading.value = false
      error({ statusCode: 500 })
    } finally {
      loading.value = false
    }
  }

  async function getDashboards (node_id: string) {
    try {
      const res = await $axios.post('/node/dashboards', {
        node_id
      })
      return res
    } catch (e) {
      loading.value = false
      error({ statusCode: 500 })
    } finally {
      loading.value = false
    }
  }

  async function createDashboard (node_id: string, dashboard_type: string) {
    loading.value = true
    try {
      const res = await $axios.post('/dashboards/create', { node_id, type: dashboard_type })
      loading.value = false
      dashboardsStore.ADD_DASHBOARD(res.data)
      return res
    } catch (e) {
      loading.value = false
      error({ statusCode: 500 })
    } finally {
      loading.value = false
    }
  }

  async function sphinxConnString (node_id: string) {
    loading.value = true
    try {
      return await $axios.post('/node/sphinx', { node_id })
    } catch (e) {
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    createNode,
    populateNode,
    postNode,
    updateNode,
    updateTls,
    updateSettings,
    loading,
    startExport,
    nodeName,
    updateStatus,
    postMacaroon,
    connectNode,
    getCert,
    getSeed,
    saveSeed,
    getPurchaseSession,
    getDashboards,
    createDashboard,
    sphinxConnString
  }
}
