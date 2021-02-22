import { defineComponent, createElement, reactive, computed } from '@vue/composition-api'
import ConfirmSeed from '~/components/ConfirmSeed'
import { generateNewXPub } from '~/utils/btc'
import { SHA256, AES, RIPEMD160 } from 'crypto-js'
import { VProgressCircular, VBtn } from 'vuetify/lib'

const h = createElement

export default defineComponent({
  components: {
    VProgressCircular,
    NodePasswordInput: () => import('~/components/NodePasswordInput.vue'),
    VBtn
  },
  setup: (_, { emit }) => {
    console.log('component setup')
    const keyPath = `/84'/0'/0'`

    const state = reactive({
      mnemonic: '',
      xPubString: '',
      loading: true,
      error: '',
      currentStep: 0
    })

    const seedArray = computed(() => state.mnemonic.split(' '))
    const accountKeyPath = computed(() => {
      if (!state.xPubString) return ''
      const shaHash = SHA256(state.xPubString)
      const fingerprint = RIPEMD160(shaHash.toString())
      const strFingerprint = fingerprint.toString()
      console.log({ fingerprint, strFingerprint })
      return `${strFingerprint.substring(0, 8)}${keyPath}`
    })

    generateNewXPub().then(({ mnemonic, xPubString}) => {
      console.log({ mnemonic })
      state.mnemonic = mnemonic
      state.xPubString = xPubString
      state.loading = false
    }).catch(e => {
      state.loading = false
      state.error = e.message
    })

    async function finalize (password?: string) {
      console.log({ password })
      const emitOutput = {
        xPub: state.xPubString,
        accountKeyPath: accountKeyPath.value
      }
      if (password) {
        const encrypted = AES.encrypt(state.mnemonic, password).toString()
        emit('finalize', Object.assign(emitOutput, { seedBackup: encrypted }))
      } else {
        emit('finalize', emitOutput)
      }
    }

    return () => {
      if (state.loading || state.error) {
        return <div class="text-center">
          <v-progress-circular indeterminate />
          <div>{state.error || 'Generating Bitcoin mnemonic seed phrase'}</div>
        </div>
      } else if (state.currentStep === 0) {
        return <ConfirmSeed seed={seedArray.value} onNext={() => { state.currentStep = 1}}/>
      } else {
        return <div class="text-center">
          <node-password-input topText="Create an encryption password" text="Backup and Create" onDone={finalize}>
            <v-btn onClick={() => finalize()} block class="my-4 info--text" color="highlight">Skip Backup</v-btn>
            <div>You can backup an encrypted copy of your seed mnemonic if you would like. Encryption happens in the browser and Voltage does not have the ability to read your seed.
            This is for convenience purposes only. You should still write down your seed phrase.</div>
          </node-password-input>
        </div>
      }
    }
  }
})

