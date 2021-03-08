import { Middleware } from '@nuxt/types'
import { authStore } from '~/store'
import { Auth } from '@aws-amplify/auth'
import type { CognitoUser } from '@aws-amplify/auth'

const loadCognito: Middleware = async () => {
  const ts = Math.round((new Date()).getTime() / 1000)
  if (!authStore.user || ts > authStore.exp) {
    try {
      const user: CognitoUser | null = await Auth.currentAuthenticatedUser()
      authStore.SET_USER(user)
    } catch (e) {
      console.error(e)
    }
  }
}

export default loadCognito
