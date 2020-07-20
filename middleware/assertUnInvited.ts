import { inviteStore } from '~/store'
import { Context, Middleware } from '@nuxt/types'

const assertUnInvited: Middleware = ({ redirect }: Context) => {
    if (inviteStore.invited) {
        return redirect('/')
    }
}

export default assertUnInvited