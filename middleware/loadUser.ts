import { Context, Middleware } from '@nuxt/types'
import { nodeStore, authStore } from '~/store'
import { Network } from '~/types/api'
import { User } from '~/types/apiResponse'

const loadUser: Middleware = async ({ store, $axios }: Context) => {
    console.log('loading nodes from /user')
    const userRes = await $axios.get<User>('/user')
    console.log({ userRes })
    nodeStore.HYDRATE_USER(userRes.data)
}

export default loadUser
