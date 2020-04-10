import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import auth from '~/store/auth'

let authStore: auth

function initialiseStores(store: Store<any>): void {
  authStore = getModule(auth, store)
}

export { initialiseStores, authStore }
