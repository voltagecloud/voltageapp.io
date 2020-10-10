import { Context, Middleware } from '@nuxt/types'
import { inviteStore } from '~/store'

const assertUnInvited: Middleware = ({ redirect }: Context) => {
  if (inviteStore.invited) {
    return redirect('/')
  }
}

export default assertUnInvited
