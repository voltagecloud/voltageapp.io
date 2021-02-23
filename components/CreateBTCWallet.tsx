import { defineComponent, createElement, reactive, computed } from '@vue/composition-api'
import { generateNewXPub } from '~/utils/btc'
import { SHA256, AES, RIPEMD160 } from 'crypto-js'
import { VProgressCircular, VBtn, VForm, VTextField, VCheckbox, VContainer } from 'vuetify/lib'

const h = createElement

export default defineComponent({
  components: {
    VProgressCircular,
    NodePasswordInput: () => import('~/components/NodePasswordInput.vue'),
    VBtn,
    VForm,
    VTextField,
    VCheckbox,
    VContainer
  },
  // @ts-ignore
  setup: (_, { emit, refs }) => {
    console.log('component setup')
    const keyPath = `/84'/0'/0'`

    const state = reactive({
      mnemonic: '',
      xPubString: '',
      loading: true,
      error: '',
      backupSeed: false,
      password: ''
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

    async function finalize () {
      const valid = refs.form.validate()
      if (!valid) return
      console.log('finalizing')
      const emitOutput = {
        xPub: state.xPubString,
        accountKeyPath: accountKeyPath.value
      }
      if (state.password) {
        const encrypted = AES.encrypt(state.mnemonic, state.password).toString()
        emit('finalize', Object.assign(emitOutput, { seedBackup: encrypted }))
      } else {
        emit('finalize', emitOutput)
      }
    }

    function handleCheckbox (v: boolean) {
      state.backupSeed = v
      if (!v) {
        // delete password if disabling backup
        state.password = ''
      }
    }

    return () => {
      if (state.loading || state.error) {
        return <div class="text-center">
          <v-progress-circular indeterminate />
          <div>{state.error || 'Generating Bitcoin mnemonic seed phrase'}</div>
        </div>
      } else {
        return <v-container class="text-center">
          { /*<node-password-input topText="Create an encryption password" text="Backup and Create" onDone={finalize}>
            <v-btn onClick={() => finalize()} block class="my-4 info--text" color="highlight">Skip Backup</v-btn>
            <div>You can backup an encrypted copy of your seed mnemonic if you would like. Encryption happens in the browser and Voltage does not have the ability to read your seed.
            This is for convenience purposes only. You should still write down your seed phrase.</div>
          </node-password-input>
             */ }
          <div class="text-h5">Bitcoin Keys</div>
          <div>
            Warning: Generating this information in the browser is considered less secure than generating it yourself.
            <br />
            <a href="">Learn how to do it yourself</a>
            <br />
            Write down your seed phrase and password (if used)! This is the only way to recover your funds. Voltage is never able read this sensitive data and we cannot help you recover it.
          </div>
          <div class="text-left my-3">
            <div class="d-flex flex-grow-1">
              <span class="font-weight-bold">Derivation Path:</span>{` ${state.xPubString}`}
            </div>
            <div class="d-flex flex-grow-1">
              <span class="font-weight-bold">Account Key Path:</span>{` ${accountKeyPath.value}`}
            </div>
            <div class="d-flex flex-grow-1">
              <span class="font-weight-bold">Derivation Path:</span>{` ${state.mnemonic}`}
            </div>
          </div>
          <v-form ref="form" lazy-validation>
            <v-checkbox
              checked={state.backupSeed}
              onChange={handleCheckbox}
              label="Backup Seed"
            />
            <v-text-field
              outlined
              disabled={!state.backupSeed}
              value={state.password}
              onInput={(v: string) => state.password = v}
              label="Password"
              type="password"
              rules={[
                (v: string) => !state.backupSeed || v.length >= 8 || 'Password must be at least 8 characters'
              ]}
            />
            <v-btn onClick={finalize} color="highlight" dark>Use Keys</v-btn> 
          </ v-form>
        </v-container>
      }
    }
  }
})

