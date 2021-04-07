import { Context, Middleware } from '@nuxt/types'
import { authStore } from '~/store'

const assertAuthed: Middleware = ({ redirect, route }: Context) => {
  // capture redirect path
  if (!authStore.user) {
    authStore.REDIRECT(route.path)
  } 


  // bypass auth check for /podcast route
  if (route.path === '/podcast') return

  if (authStore.user && authStore.redirect) {
    const to = authStore.redirect
    authStore.REDIRECT('')
    return redirect(to)
  }

  return redirect('/login')
}

export default assertAuthed
