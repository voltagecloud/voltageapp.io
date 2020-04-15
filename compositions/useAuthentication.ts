import { authStore } from '~/store'
import { layoutStore } from '~/store'
import { Auth } from '@aws-amplify/auth'
import { ref } from '@vue/composition-api'

export default function useAuthentication () {
    const loading = ref(false)

    async function login (email: string, password:string) {
        loading.value = true
        const user = await Auth.signIn(email, password)
        authStore.SET_USER(user)
        loading.value = false
        return user
    }

    async function register (email: string, password: string) {
        loading.value = true
        const user = await Auth.signUp({
            username: email,
            password
        })
         loading.value = false
        return user
    }

    async function load () {
        loading.value = true
        try {
            const user = await Auth.currentAuthenticatedUser()
            authStore.SET_USER(user)
            loading.value = false
            return user
        } catch (error) {
            loading.value = false
            console.log({ error })
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
        const res = await Auth.resendSignUp(email)
        loading.value = false
        return res
    }

    async function confirm (email: string, code: string) {
        loading.value = true
        const res = await Auth.confirmSignUp(email, code)
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
        confirm
    }
}