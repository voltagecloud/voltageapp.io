import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import layout from '~/store/layout'
import auth from '~/store/auth'
import node from '~/store/node'
import create from '~/store/create'
import exports from '~/store/exports'
import lnd from '~/store/lnd'

let layoutStore: layout
let authStore: auth
let nodeStore: node
let createStore: create
let exportsStore: exports
let lndStore: lnd

function initialiseStores (store: Store<any>): void {
  layoutStore = getModule(layout, store)
  authStore = getModule(auth, store)
  nodeStore = getModule(node, store)
  createStore = getModule(create, store)
  exportsStore = getModule(exports, store)
  lndStore = getModule(lnd, store)
}

export {
  initialiseStores,
  layoutStore,
  authStore,
  nodeStore,
  createStore,
  exportsStore,
  lndStore
}
