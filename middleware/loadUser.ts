import { Context, Middleware } from '@nuxt/types'
import { nodeStore } from '~/store'
import { User } from '~/types/apiResponse'

const loadUser: Middleware = async ({ $axios }: Context) => {
  const userRes = await $axios.get<User>('/user')
  nodeStore.HYDRATE_USER(userRes.data)
}

export default loadUser
