import { Context, Middleware } from '@nuxt/types'
import { authStore } from '~/store'

const assertAuthed: Middleware = ({ redirect, route }: Context) => {
  if (!authStore.user) {
    authStore.REDIRECT(route.path)
    return redirect('/login')
  } else if (authStore.user && authStore.redirect) {
    const to = authStore.redirect
    authStore.REDIRECT('')
    return redirect(to)
  }
}

export default assertAuthed
