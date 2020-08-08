import { Context, Middleware } from '@nuxt/types'
import { nodeStore } from '~/store'
import { User } from '~/types/apiResponse'

const loadUser: Middleware = async ({ $axios }: Context) => {
  console.log('loading nodes from /user')
  const userRes = await $axios.get<User>('/user')
  console.log({ userRes })
  nodeStore.HYDRATE_USER(userRes.data)
}

export default loadUser
