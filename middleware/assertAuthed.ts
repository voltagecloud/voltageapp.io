import { Context, Middleware } from '@nuxt/types'
import { authStore } from '~/store'

const assertAuthed: Middleware = ({ redirect, route }: Context) => {
  // bypass auth check for /podcast route
  if (route.path === '/podcast') return
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
