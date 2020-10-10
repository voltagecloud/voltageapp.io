import { Context, Middleware } from '@nuxt/types'
import { authStore } from '~/store'

const assertUnAuthed: Middleware = ({ redirect }: Context) => {
  if (authStore.user) {
    return redirect('/')
  }
}

export default assertUnAuthed
