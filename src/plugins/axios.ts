import { Context } from '@nuxt/types'
import { authStore } from '~/store'

export default ({ $axios, store }: Context) => {
    $axios.onRequest((config) => {
        // const auth = store.getters['auth/accessToken']
        // if (auth) {
        //     config.headers.common.Authorization = `Bearer ${auth}`
        // }
        if (!!authStore.user) {
            const access = authStore.user.getSignInUserSession()?.getAccessToken()?.getJwtToken()
            console.log({ access })
            config.headers.common.Authorization = `Bearer ${access}`
        }
    })
}
