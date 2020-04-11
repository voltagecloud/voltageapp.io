import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { CognitoUser } from '@aws-amplify/auth'

@Module({
    name: 'layout',
    stateFactory: true,
    namespaced: true
})
export default class AuthModule extends VuexModule {
    user?: CognitoUser = undefined

    @Mutation
    SET_USER (user?: CognitoUser) {
        this.user = user
    }
}