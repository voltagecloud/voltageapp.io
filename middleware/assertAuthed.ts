import { authStore } from '~/store'
import { Context, Middleware } from '@nuxt/types'
import useAuthentication from '~/compositions/useAuthentication'

const assertAuthed: Middleware = async ({ redirect }: Context) => {
    if (!authStore.user) {
        const { load } = useAuthentication()
        await load()
    }
    if (!authStore.user) {
        return redirect('/login')
    }
}

export default assertAuthed