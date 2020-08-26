import { authStore } from '~/store'
import { Middleware } from '@nuxt/types'
import useAuthentication from '~/compositions/useAuthentication'

const loadCognito: Middleware = async () => {
    const ts = Math.round((new Date()).getTime() / 1000)
    if (!authStore.user || ts > authStore.exp) {
        const { load } = useAuthentication()
        const user = await load()
    }
}

export default loadCognito
