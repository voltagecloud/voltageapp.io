import { authStore } from '~/store'
import { layoutStore } from '~/store'
import { Auth, CognitoUser } from '@aws-amplify/auth'
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
        const res = await Auth.forgotPassword(email)
        loading.value = false
        return res
    }

    async function confirmNewPassword (email: string, code: string, newPw: string) {
        loading.value = true
        const res = await Auth.forgotPasswordSubmit(email, code, newPw)
        loading.value = false
        return res
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
        confirmNewPassword
    }
}