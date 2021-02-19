import { Context, Middleware } from '@nuxt/types'
import { createStore } from '~/store'

const captureReferral: Middleware = ({ route }: Context) => {
  const code = route.query.podcast_id as string|null
  if (code) {
    createStore.REFERRAL(code)
  }
}

export default captureReferral
