import { Module, VuexModule, Mutation } from 'vuex-module-decorators'

@Module({
  name: 'lnd',
  stateFactory: true,
  namespaced: true
})
export default class ExportsModule extends VuexModule {
    cipher_seed_mnemonic: string[] = []
    enciphered_seed: string = ''
    currentNode = ''
    currentNodeId = ''
    macaroon = ''

    @Mutation
    SEED ({ enciphered_seed, cipher_seed_mnemonic }: { enciphered_seed: string; cipher_seed_mnemonic: string[]}) {
      this.cipher_seed_mnemonic = cipher_seed_mnemonic
      this.enciphered_seed = enciphered_seed
    }

    @Mutation
    CURRENT_NODE (v: string) {
      this.currentNode = `https://${v}:8080`
    }

    @Mutation
    CURRENT_NODE_ID (v: string) {
      console.log("HEERERERER")
      console.log(v)
      this.currentNodeId = v
    }

    @Mutation
    MACAROON (v: string) {
      this.macaroon = v
    }
}
