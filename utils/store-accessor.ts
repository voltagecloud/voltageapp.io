import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import layout from '~/store/layout'
import auth from '~/store/auth'
import node from '~/store/node'
import create from '~/store/create'

let layoutStore: layout
let authStore: auth
let nodeStore: node
let createStore: create

function initialiseStores(store: Store<any>): void {
  layoutStore = getModule(layout, store)
  authStore = getModule(auth, store)
  nodeStore = getModule(node, store)
  createStore = getModule(create, store)
}

export {
    initialiseStores,
    layoutStore,
    authStore,
    nodeStore,
    createStore
}
