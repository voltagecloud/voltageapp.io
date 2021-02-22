import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { voltageFetch } from '~/utils/fetchClient' 
import { decryptMacaroon, base64ToHex } from '~/utils/crypto'

interface NodePassword {
  nodeId: string;
  password: string;
}

interface NodeMeta {
  nodeId: string;
  endpoint: string;
  tlsCert: string;
}

interface NodeMacaroon {
  nodeId: string;
  macaroon: string;
  type: string
}

function reduceArray<T extends { nodeId: string; }> (arr: T[], elem: T, match: string): T[] {
  // if the current array is empty just return array with appended elem
  if (arr.length === 0) return [elem]
  // track whether this data has been added while reducing
  let hasAdded = false
  return arr.reduce((acc: T[], cur: T, i: number, full: T[]) => {
    // replace this nodes data if it exists
    if (cur.nodeId === match) {
      hasAdded = true
      return [...acc, elem]
    // if this is the last element and we have not added, append to array
    } else if (i === full.length - 1 && !hasAdded) {
      return [...acc, cur, elem]
    // otherwise just add in the current element as we reduce
    } else {
      return [...acc, cur]
    }
  }, [] as T[])
}

@Module({
  name: 'macaroon',
  stateFactory: true,
  namespaced: true
})
export default class MacaroonModule extends VuexModule {
  nodePasswords: NodePassword[] = []
  macaroons: NodeMacaroon[] = []
  nodeMeta: NodeMeta[] = []
  loading = false

  @Mutation
  NODE_PASSWORD ({ password, nodeId }: { password: string; nodeId: string }) {
    const nextState = reduceArray(this.nodePasswords, { password, nodeId }, nodeId)
    console.log({ nextState })
    this.nodePasswords = nextState
  }

  @Mutation
  NODE_META (meta: NodeMeta) {
    this.nodeMeta = reduceArray(this.nodeMeta, meta, meta.nodeId)
  }

  @Mutation
  MACAROON (macaroon: NodeMacaroon) {
    this.macaroons = reduceArray(this.macaroons, macaroon, macaroon.nodeId)
  }

  @Mutation
  LOADING (val: boolean) {
    this.loading = val
  }

  @Action
  async FETCH_MACAROON (
    { nodeId, macaroonType, password }:
    { nodeId: string; macaroonType: string; password?: string }
  ) {
    console.log('enter action')
    if (password) {
      console.log({ password })
      this.context.commit('NODE_PASSWORD', { nodeId, password })
    }
    console.log('sending request')
    try {
      const res = await voltageFetch('/node/connect', {
        method: 'POST',
        body: JSON.stringify({
          node_id: nodeId,
          name: macaroonType
        })
      })
      if (!res.ok) return 'Error retrieving the macaroon'
      const json = await res.json()
      console.log({ json })
      const { macaroon, endpoint, tls_cert } = json
      if (!macaroon) return 'Could not find macaroon'
      // write node meta to store
      this.context.commit('NODE_META', { nodeId, tlsCert: tls_cert, endpoint })
      // write encrypted macaroon to store
      this.context.commit('MACAROON', { nodeId, type: macaroonType, macaroon })
    } catch (e) {
      console.error(e)
      return e
    }
  }

  get findNodeMeta() {
    return ({ nodeId }: { nodeId: string }) => {
      return this.nodeMeta.find(elem => elem.nodeId === nodeId)
    }
  }

  get macaroonState() {
    return ({ nodeId, type }: { nodeId: string; type: string }) => {
      let error = ''
      let macaroon = ''
      let macaroonHex = ''
      // asume the required password is in store
      const pwObj = this.nodePasswords.find(elem => elem.nodeId === nodeId)
      const password = pwObj?.password || ''
      const encrypted = this.macaroons.find(elem => elem.nodeId === nodeId && elem.type === type) || ''
      if (password && encrypted) {
        const payload = decryptMacaroon({
          encrypted: encrypted.macaroon,
          password: password
        })
        error = payload.error
        macaroon = payload.macaroon
        if (payload.macaroon) { macaroonHex = base64ToHex(payload.macaroon) }
      }
      return {
        error,
        macaroon,
        macaroonHex,
        password,
        encrypted
      }
    }
  }
}
