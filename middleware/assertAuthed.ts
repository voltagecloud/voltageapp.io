import { authStore } from '~/store'
import { Context, Middleware } from '@nuxt/types'

const assertAuthed: Middleware = ({ redirect }: Context) => {
    if (!authStore.user) {
        return redirect('/login')
    }
}

export default assertAuthed