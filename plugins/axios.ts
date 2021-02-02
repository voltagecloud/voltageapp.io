import { Context } from '@nuxt/types'
import { Auth } from '@aws-amplify/auth'
// import { authStore } from '~/store'

export default ({ $axios }: Context) => {
  // $axios.onRequest((config) => {
  //  if (authStore.user) {
  //    const access = authStore.user.getSignInUserSession()?.getAccessToken()?.getJwtToken()
  //    config.headers.common.Authorization = `Bearer ${access}`
  //  }
  // })
  $axios.interceptors.request.use(async (config) => {
    const user = await Auth.currentAuthenticatedUser()
    const accessToken = user.getSignInUserSession().getAccessToken()
    const jwt = accessToken.getJwtToken()
    config.headers.common.Authorization = `Bearer ${jwt}`
    return config
  })
}
