import { Context, Middleware } from '@nuxt/types'
import { nodeStore, authStore } from '~/store'
import type { User, Node } from '~/types/apiResponse'

const loadUser: Middleware = async ({ $axios }: Context) => {
  // skip if user not signed in
  if (!authStore.user) return
  // skip if data already exists
  if (!!nodeStore.user) return
  const user = await $axios.get<User>('/user')
  const nodes = await $axios.get<{nodes: Node[]}>('/node')

  nodeStore.HYDRATE_USER({ user: user.data, nodes: nodes.data.nodes })
}

export default loadUser
