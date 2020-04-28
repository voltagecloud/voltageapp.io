import { authStore } from '~/store'
import { layoutStore } from '~/store'
import { Auth } from '@aws-amplify/auth'
import { ref } from '@vue/composition-api'

export default function useAuthentication () {
    const loading = ref(false)
    const error = ref('')

    async function login (email: string, password:string) {
        loading.value = true
        try {
            const user = await Auth.signIn(email, password)
            authStore.SET_USER(user)
            return user
        } catch(e) {
            error.value = e
        } finally {
            loading.value = false
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
            const user = await Auth.currentAuthenticatedUser()
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

    return {
        loading,
        login,
        register,
        load,
        logout,
        resend,
        confirm,
        error
    }
}