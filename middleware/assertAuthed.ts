import { authStore } from '~/store'
import { Context, Middleware } from '@nuxt/types'
import useAuthentication from '~/compositions/useAuthentication'
import Auth from '@aws-amplify/auth'

const assertAuthed: Middleware = async ({ redirect }: Context) => {
    const ts = Math.round((new Date()).getTime() / 1000)
    if (!authStore.user || ! await Auth.currentSession()) {
        const { load } = useAuthentication()
        await load()
    }
    if (!authStore.user) {
        return redirect('/login')
    }
}

export default assertAuthed