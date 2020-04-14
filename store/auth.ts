import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { CognitoUser } from '@aws-amplify/auth'

@Module({
    name: 'auth',
    stateFactory: true,
    namespaced: true
})
export default class AuthModule extends VuexModule {
    user: CognitoUser | null = null

    @Mutation
    SET_USER (user: CognitoUser | null) {
        this.user = user
    }
}