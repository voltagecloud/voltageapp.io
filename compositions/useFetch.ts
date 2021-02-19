import { Auth } from '@aws-amplify/auth'
import { ref } from '@vue/composition-api'

export default function useFetch <T>(endpoint: string) {
  const data = ref<T|null>(null)
  const error = ref<Error|null>(null)
  const statusCode = ref<number>(0)
  const loading = ref(false)

  async function dispatch(opts: RequestInit) {
    const user = await Auth.currentAuthenticatedUser()
    const accessToken = user.getSignInUserSession().getAccessToken()
    const jwt = accessToken.getJwtToken()

    
    loading.value = true
    const res = await fetch(`${process.env.apiEndpoint}${endpoint}`, Object.assign(opts, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
        ...(opts?.headers || {})
      }
    }))

    try {
      data.value = await res.json() as T
    } catch (e) {
      error.value = e
    } finally {
      statusCode.value = res.status
      loading.value = false
    }
  }


  return {
    data,
    error,
    statusCode,
    loading,
    dispatch
  }
}
