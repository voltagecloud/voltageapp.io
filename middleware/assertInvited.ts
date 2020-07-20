import { inviteStore } from '~/store'
import { Context, Middleware } from '@nuxt/types'

const assetInvited: Middleware = ({ redirect }: Context) => {
    if (!inviteStore.invited) {
        return redirect('/invite')
    }
}

export default assetInvited