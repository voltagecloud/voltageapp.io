import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { CognitoUser } from '@aws-amplify/auth'

@Module({
  name: 'auth',
  stateFactory: true,
  namespaced: true
})
export default class AuthModule extends VuexModule {
    user: CognitoUser | null = null
    exp: number = 0
    redirect  = ""

    @Mutation
    SET_USER (user: CognitoUser | null) {
      this.user = user
      this.exp = user?.getSignInUserSession()?.getAccessToken().getExpiration() || 0
    }

    @Mutation
    REDIRECT (to: string) {
      this.redirect = to
    }
}
