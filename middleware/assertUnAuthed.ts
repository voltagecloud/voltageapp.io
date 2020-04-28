import { authStore } from '~/store'
import { Context } from '@nuxt/types'
import useAuthentication from '~/compositions/useAuthentication'
import Auth from '@aws-amplify/auth'

export default async ({ route, redirect }: Context) => {
    if (!authStore.user || ! await Auth.currentSession()) {
        const { load } = useAuthentication()
        const user = await load()
    }
    if (!!authStore.user) {
        return redirect('/')
    }
}