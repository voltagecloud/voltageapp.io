import { Auth } from '@aws-amplify/auth'

export async function voltageFetch (endpoint: string, opts: RequestInit) {
  const user = await Auth.currentAuthenticatedUser()
  const accessToken = user.getSignInUserSession().getAccessToken()
  const jwt = accessToken.getJwtToken()
  return fetch(`${process.env.apiEndpoint}${endpoint}`, Object.assign(opts, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
      ...(opts?.headers || {})
    }
  }))
}
