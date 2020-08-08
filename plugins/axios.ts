import { Context } from '@nuxt/types'
import { authStore } from '~/store'

export default ({ $axios }: Context) => {
  $axios.onRequest((config) => {
    // const auth = store.getters['auth/accessToken']
    // if (auth) {
    //   config.headers.common.Authorization = `Bearer ${auth}`
    // }
    if (authStore.user) {
      const access = authStore.user.getSignInUserSession()?.getAccessToken()?.getJwtToken()
      config.headers.common.Authorization = `Bearer ${access}`
    }
  })
}
