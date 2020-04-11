import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import layout from '~/store/layout'
import auth from '~/store/auth'

let layoutStore: layout
let authStore: auth

function initialiseStores(store: Store<any>): void {
  layoutStore = getModule(layout, store)
  authStore = getModule(auth, store)
}

export {
    initialiseStores,
    layoutStore,
    authStore
}
