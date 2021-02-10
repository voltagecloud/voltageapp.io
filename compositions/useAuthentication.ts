import { Auth, CognitoUser } from '@aws-amplify/auth'
import { ref } from '@vue/composition-api'
import { authStore } from '~/store'

export default function useAuthentication () {
  const loading = ref(false)
  const showMFA = ref(false)
  const error = ref('')
  const tmpUser = ref<CognitoUser|null>(null)

  async function login (email: string, password:string) {
    loading.value = true
    try {
      const user = await Auth.signIn(email, password)
      if (user.challengeName) {
        showMFA.value = true
        tmpUser.value = user
      } else {
        authStore.SET_USER(user)
        return user
      }
    } catch (e) {
      if (e.code === 'UserNotFoundException' ||
        e.code === 'NotAuthorizedException') {
        error.value = 'Invalid Login'
      } else {
        error.value = e
      }
    } finally {
      loading.value = false
    }
  }

  async function confirmLogin (token: string) {
    if (tmpUser.value) {
      try {
        const user = await Auth.confirmSignIn(tmpUser.value, token, 'SOFTWARE_TOKEN_MFA')
        authStore.SET_USER(user)
        return user
      } catch (e) {
        error.value = e
        console.error(e)
      }
    }
  }

  async function register (email: string, password: string) {
    loading.value = true
    try {
      return await Auth.signUp({
        username: email,
        password
      })
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  async function load () {
    loading.value = true
    try {
      const user: CognitoUser | null = await Auth.currentAuthenticatedUser()
      authStore.SET_USER(user)
      return user
    } catch (e) {
      console.log({ e })
      error.value = e
    } finally {
      loading.value = false
    }
  }

  async function logout () {
    loading.value = true
    await Auth.signOut()
    authStore.SET_USER(null)
    loading.value = false
    return true
  }

  async function resend (email: string) {
    loading.value = true
    try {
      return await Auth.resendSignUp(email)
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  async function confirm (email: string, code: string) {
    loading.value = true
    try {
      return await Auth.confirmSignUp(email, code)
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  async function forgotPassword (email: string) {
    loading.value = true
    try {
      return await Auth.forgotPassword(email)
    } catch (e) {
      if (e.code === 'UserNotFoundException') {
        error.value = 'Email not found'
      } else {
        error.value = e
      }
    } finally {
      loading.value = false
    }
  }

  async function confirmNewPassword (email: string, code: string, newPw: string): Promise<boolean> {
    loading.value = true
    try {
      await Auth.forgotPasswordSubmit(email, code, newPw)
      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    login,
    register,
    load,
    logout,
    resend,
    confirm,
    error,
    forgotPassword,
    confirmNewPassword,
    confirmLogin,
    showMFA
  }
}
