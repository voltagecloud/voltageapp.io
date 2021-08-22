import { defineComponent, reactive, computed } from '@vue/composition-api'
import { generateNewXPub } from '~/utils/btc'
import { SHA256, AES, RIPEMD160 } from 'crypto-js'
import { VProgressCircular, VBtn, VForm, VTextField, VCheckbox, VContainer, VCol, VRow, VDialog, VCard, VCardActions, VCardText } from 'vuetify/lib'


export default defineComponent({
  components: {
    VProgressCircular,
    NodePasswordInput: () => import('~/components/NodePasswordInput.vue'),
    VBtn,
    VForm,
    VTextField,
    VCheckbox,
    VContainer,
    VCol,
    VRow,
    VDialog,
    VCard,
    VCardActions,
    VCardText
  },
  // @ts-ignore
  setup: (_, { emit, refs }) => {
    const keyPath = `/84'/0'/0'`

    const state = reactive({
      mnemonic: '',
      xPubString: '',
      fingerprint: '',
      loading: true,
      error: '',
      backupSeed: false,
      password: '',
      confirmDialog: false
    })

    const accountKeyPath = computed(() => {
      return `${state.fingerprint}${keyPath}`
    })

    generateNewXPub().then(({ mnemonic, xPubString, fingerprint }) => {
      state.mnemonic = mnemonic
      state.xPubString = xPubString
      state.fingerprint = fingerprint
      state.loading = false
    }).catch(e => {
      state.loading = false
      state.error = e.message
    })

    async function finalize () {
      const form = refs.form as HTMLFormElement
      const valid = form.validate()
      if (!valid) return
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
        return <v-container class="text-center pt-0">
          { /*<node-password-input topText="Create an encryption password" text="Backup and Create" onDone={finalize}>
            <v-btn onClick={() => finalize()} block class="my-4 info--text" color="highlight">Skip Backup</v-btn>
            <div>You can backup an encrypted copy of your seed mnemonic if you would like. Encryption happens in the browser and Voltage does not have the ability to read your seed.
            This is for convenience purposes only. You should still write down your seed phrase.</div>
          </node-password-input>
             */ }
          <div class="text-h5">Generated Bitcoin Wallet</div>
          <div>
            <a
              href="https://docs.voltage.cloud/btcpay-server/btcpay-server-faq#is-generating-my-bitcoin-wallet-in-your-dashboard-safe"
              target="_blank"
            >
              Learn about the security model of creating the keys in our dashboard.
            </a>
            <br />
          </div>
          <div>
            <br />
            <p>
              These keys are used in your BTCPay Server store to receive on-chain funds.
            </p>
          </div>
          <v-container class="text-left">
            <v-row class="my-3">
              <v-col cols="12" md="3" class="font-weight-bold pa-0">
                Derivation Path:
              </v-col>
              <v-col cols="12" md="9" class="pa-0">
                {` ${state.xPubString}`}
              </v-col>
            </v-row>
            <v-row class="my-3">
              <v-col cols="12" md="3" class="font-weight-bold pa-0">
                Account Key Path:
              </v-col>
              <v-col cols="12" md="9"  class="pa-0">
                {` ${accountKeyPath.value}`}
              </v-col>
            </v-row>
            <v-row class="my-3">
              <v-col cols="12" md="3" class="font-weight-bold pa-0">
                Seed Phrase:
              </v-col>
              <v-col cols="12" md="9" class="pa-0 font-weight-bold text-h6">
                {` ${state.mnemonic}`}
              </v-col>
            </v-row>
          </v-container>
          <v-form ref="form" onSubmit={(e: Event) => { e.preventDefault(); state.confirmDialog = true }} lazy-validation>
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
              label="Password for Encrypting Seed"
              type="password"
              rules={[
                (v: string) => !state.backupSeed || v.length >= 8 || 'Password must be at least 8 characters'
              ]}
            />
            <div class="mb-3">
              <i>You must write down your seed phrase and password somewhere outside of Voltage. 
              Your funds will be lost if you don't keep a copy of your seed phrase. Not even Voltage can recover them for you.</i>
            </div>
            <v-btn onClick={() => state.confirmDialog = true} color="highlight" dark>Use Keys</v-btn> 
            <v-dialog value={state.confirmDialog} onInput={(v: boolean) => state.confirmDialog = v}>
              <v-card>
                <v-container>
                  <v-card-text>Are you sure you have written down your keys? They will not be shown again.</v-card-text>
                  <v-card-actions>
                    <v-btn color="highlight" onClick={finalize} dark>Yes, continue</v-btn>
                    <v-btn onClick={() => state.confirmDialog = false}>No, go back</v-btn>
                  </v-card-actions>
                </v-container>
              </v-card>
            </v-dialog>
          </ v-form>
        </v-container>
      }
    }
  }
})

