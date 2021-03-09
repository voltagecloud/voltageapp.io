import { defineComponent, ref, PropType } from '@vue/composition-api'
import { lndStore } from '~/store'
import useAnimation from '~/compositions/useAnimation'
import useClipboard from '~/compositions/useClipboard'
import { VDivider, VFadeTransition, VChip, VBtn, VCard, VCardText, VCardActions, VDialog } from 'vuetify/lib'


export default defineComponent({
  components: {
    VDivider, VFadeTransition, VChip, VBtn, VCard, VCardText, VCardActions, VDialog
  },
  props: {
    seed: {
      type: Array as PropType<Array<string>>|PropType<Readonly<Array<string>>>,
      required: true
    }
  },
  setup: (props, { root, emit }) => {
    const confirmModal = ref(false)

    async function closeAndConfirm () {
      confirmModal.value = false
      emit('next')
    }

    const { copy } = useClipboard(2000)
    function copySeed () {
      const seedStr = lndStore.cipher_seed_mnemonic.join(' ')
      copy(seedStr)
    }

    const { beforeEnter, enter } = useAnimation()

    return () => <div>
      <div class="text-center warning--text display-1">
        Your seed phrase is
      </div>
      <v-divider class="mx-12 mb-6" />
      <v-fade-transition
        class="justify-center align-center row px-2"
        group="group"
        appear="appear"
        tag="div"
        justify="center"
        css={false}
        style="width: 100%;"
        before-enter={beforeEnter} 
        enter={enter}
      >
        {props.seed.map((word, i) =>
          <span class="display-3 font-weight-thin warning--text px-3"
             key={i}
             data-index={i}
             style="transition: all 0.5s ease-in-out; word-spacing: 1rem;"
          >
            { word }
          </span>
        )}
      </v-fade-transition>
      <v-divider class="mx-12 mt-6" />
      <div class="text-center warning--text mb-12">
        Write down your seed phrase in a safe place. You will need it to recover your node and funds. Voltage is not responsible for lost seeds.<p></p>
        <v-chip
          class="align-center justify-center"
          color="accent"
          text-color="warning" 
          onClick={copySeed}
        >
          Click Here to Copy Seed
        </v-chip>
      </div>
      <v-btn
        class="info--text"
        block
        color="highlight"
        depressed
        onClick={() => {confirmModal.value = true}}
      >
        I have written down my seed phrase
      </v-btn>
      <v-dialog value={confirmModal.value} onInput={(v: boolean) => {confirmModal.value = v}} max-width="800">
        <v-card>
          <v-card-text
            class="pt-3 font-weight-light warning--text text--darken-1"
          >
            Are you positive you wrote this seed down in a safe place?
            No one, including Voltage, will be able to recover your node if this is lost.
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="info"
              onClick={closeAndConfirm}
            >
              Yes
            </v-btn>
            <v-btn onClick={() => {confirmModal.value = false}}>
              No
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  }
})
