import { authStore } from '~/store'
import { Context, Middleware } from '@nuxt/types'

const assertUnAuthed: Middleware = ({ redirect }: Context) => {
    if (authStore.user) {
        return redirect('/')
    }
}

export default assertUnAuthed