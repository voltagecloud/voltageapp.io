import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import voltageFetch from '~/utils/fetchClient' 
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
    this.nodePasswords = reduceArray(this.nodePasswords, { password, nodeId }, nodeId)
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
    if (password) {
      this.context.commit('NODE_PASSWORD', { nodeId, password })
    }
    const res = await voltageFetch('/node/connect', {
      body: JSON.stringify({
        node_id: nodeId,
        name: macaroonType
      })
    })
    if (!res.ok) throw Error('Failed to retrieve macaroon from endpoint') 
    const { macaroon, endpoint, tls_cert } = await res.json()
    if (!macaroon) throw Error ('Macaroon was not found')
    // write node meta to store
    this.context.commit('NODE_META', { nodeId, tlsCert: tls_cert, endpoint })
    // write encrypted macaroon to store
    this.context.commit('MACAROON', { nodeId, type: macaroonType, macaroon })
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
