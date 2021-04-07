import { Context, Middleware } from '@nuxt/types'
import { authStore } from '~/store'

const assertAuthed: Middleware = ({ redirect, route }: Context) => {
  // capture redirect path
  if (!authStore.user) {
    authStore.REDIRECT(route.path)
  } 


  // bypass auth check for /podcast route
  console.log(route.path)
  if (route.path.includes('/podcast')) {
    console.log('skipping redirect for podcast route')
    return
  }

  if (authStore.user && authStore.redirect) {
    const to = authStore.redirect
    authStore.REDIRECT('')
    return redirect(to)
  }

  if (!authStore.user) return redirect('/login')
}

export default assertAuthed
