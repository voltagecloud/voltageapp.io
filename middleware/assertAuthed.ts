import { authStore } from '~/store'
import { Context } from '@nuxt/types'
import useAuthentication from '~/compositions/useAuthentication'

export default async ({ route, redirect }: Context) => {
    if (!authStore.user) {
        const { load } = useAuthentication()
        await load()
    }
    if (!authStore.user) {
        return redirect('/login')
    }
}