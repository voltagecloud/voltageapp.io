import type { Middleware, Context } from '@nuxt/types'

const maintenance: Middleware = ({ redirect, route }: Context) => {
  if (route.fullPath !== '/maintenance') {
    return redirect('/maintenance')
  }
}

export default maintenance
