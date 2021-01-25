import { Context } from '@nuxt/types'
import { authStore } from '~/store'

export default ({ $axios }: Context) => {
  $axios.onRequest((config) => {
    if (authStore.user) {
      const access = authStore.user.getSignInUserSession()?.getAccessToken()?.getJwtToken()
      config.headers.common.Authorization = `Bearer ${access}`
    }
  })
}
