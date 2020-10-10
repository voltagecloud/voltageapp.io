import { Context, Middleware } from '@nuxt/types'
import { authStore } from '~/store'

const assertAuthed: Middleware = ({ redirect }: Context) => {
  if (!authStore.user) {
    return redirect('/login')
  }
}

export default assertAuthed
