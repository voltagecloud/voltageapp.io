import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { Node } from '~/types/apiResponse'

@Module({
  name: 'lnd',
  stateFactory: true,
  namespaced: true
})
export default class ExportsModule extends VuexModule {
    cipher_seed_mnemonic: string[] = []
    enciphered_seed: string = ''
    currentNode: Node|null = null
    macaroon = ''

    @Mutation
    SEED ({ enciphered_seed, cipher_seed_mnemonic }: { enciphered_seed: string; cipher_seed_mnemonic: string[]}) {
      this.cipher_seed_mnemonic = cipher_seed_mnemonic
      this.enciphered_seed = enciphered_seed
    }

    @Mutation
    CURRENT_NODE (v: Node) {
      this.currentNode = v
    }

    @Mutation
    MACAROON (v: string) {
      this.macaroon = v
    }
}
