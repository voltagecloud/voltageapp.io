import { Context, Middleware } from '@nuxt/types'
import { inviteStore } from '~/store'

const assetInvited: Middleware = ({ redirect }: Context) => {
  if (!inviteStore.invited) {
    return redirect('/invite')
  }
}

export default assetInvited
