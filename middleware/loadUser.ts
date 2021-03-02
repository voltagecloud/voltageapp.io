import { Context, Middleware } from '@nuxt/types'
import { nodeStore } from '~/store'
import type { User, Node } from '~/types/apiResponse'

const loadUser: Middleware = async ({ $axios }: Context) => {
  const user = await $axios.get<User>('/user')
  const nodes = await $axios.get<{nodes: Node[]}>('/node')

  nodeStore.HYDRATE_USER({ user: user.data, nodes: nodes.data.nodes })
}

export default loadUser
