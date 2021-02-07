import { defineComponent, createElement, PropType, computed, reactive } from '@vue/composition-api'
import type { Node } from '~/types/apiResponse'
import useDecryptMacaroon from '~/compositions/useDecryptMacaroon'
import { decryptMacaroon } from '~/utils/crypto'
import { hexToBase64 } from '~/utils/crypto'
import axios from 'axios'
import useNodeApi from '~/compositions/useNodeApi'

const h = createElement

export default defineComponent({
  components: {
    VContainer: () => import('vuetify/lib').then(m => m.VContainer)
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true
    }
  },
  setup: (props, ctx) => {
    const { macaroon, apiEndpoint, macaroonHex, password } = useDecryptMacaroon(ctx, props.node.node_id)
    const nodename = computed(() => apiEndpoint.value.split('.')[0])

    const state = reactive({
      loading: false,
      readOnlyMacaroonRaw: '',
      error: '',
      checkedForReadOnly: false
    })
    const readOnlyMacaroonB64 = computed(() => state.readOnlyMacaroonRaw ? hexToBase64(state.readOnlyMacaroonRaw) : '')
    const readOnlyMacaroonHex = computed(() => state.readOnlyMacaroonRaw.toUpperCase())

    
    state.loading = true
    try {
      // @ts-ignore
      connectNode(root.$nuxt.$route.params.id, 'readonly').then(({ macaroon }) => {
        state.checkedForReadOnly = true
        if (macaroon) {
          const { macaroon: decrypted, error } = decryptMacaroon({ password: password.value, encrypted: macaroon })
          state.error = error
          state.readOnlyMacaroonRaw = decrypted
        } else {
          // IMPLEMENT MACAROON UPLOAD
        }
      })
    } catch (e) {
      state.error = e.toString()
    }
    finally {
      state.loading = false
    }

    async function createReadonlyMac () {
      state.loading = true
      try {
        const res = await axios({
          method: 'POST',
          url: `https://${apiEndpoint}:8080/v1/macaroon`,
          data: {
            permissions: [
              {
                entity: 'info',
                action: 'read'
              },
              {
                entity: 'peers',
                action: 'read'
              },
              {
                entity: 'message',
                action: 'read'
              },
              {
                entity: 'address',
                action: 'read'
              },
              {
                entity: 'offchain',
                action: 'read'
              },
              {
                entity: 'onchain',
                action: 'read'
              }
            ]
          },
          headers: {
            'Grpc-Metadata-macaroon': macaroonHex.value
          }
        })
        // @ts-ignore
        state.readOnlyMacaroonRaw = res.data
        state.loading = false
        // @ts-ignore
        const encrypted = crypto.AES.encrypt(b64ByteMac, props.pass).toString()
        const { postMacaroon } = useNodeApi(ctx.root.$nuxt.context)
        await postMacaroon(ctx.root.$route.params.id, 'readonly', encrypted)
      } catch (err) {
        state.error = `${err}`
      } finally {
        state.loading = false
      }
    }

    return () => <v-container class="text-center">
      <p class="font-weight-light text--darken-1 v-card__title justify-center align-center">
        <a href="https://lightningjoule.com" target="_blank">
          Joule
        </a>
      </p>
      { !props.node.settings.rest
        ? (<div>
          <div
            class="font-weight-light text--darken-1 justify-center align-center"
            max-width="800"
            style="color: #ff0000; padding: 20px;"
          >
            Joule uses the REST API to communicate with your node.
            You have this API disabled in your node settings.
            Please enable it to connect with Joule.
          </div>
          <ul class="text-left">
            <li>Click the 'Get Started' button in Joule. Then select 'Remote Node'.</li>
            <li>Copy the Node URL below and paste it into the 'Node URL' field in Joule.</li>
            <li>Upload or paste both the Admin macaroon and a Readonly macaroon. Click 'Continue'.</li>
            <li>Create a password for Joule when prompted.</li>
          </ul>
        </div>)
        : (<div>
          <div>Node URL</div>
          <copy-pill class="text-break" text={`https://${apiEndpoint.value}:8080`} color="accent" text-color="warning" />
          <p class="font-weight-light">click to copy</p>
          <p class="text--darken-1 v-card__title justify-center align-center">Admin Macaroon</p>
          <v-btn
            class="info--text"
            color="warning"
            text-color="highlight"
            href={`data:application/text-plain;base64,${macaroon.value}`}
            download="admin.macaroon"
            title="admin.macaroon"
          >
            Download Macaroon
          </v-btn>
          <div>Hex:</div>
          <copy-pill class="text-break" text={macaroonHex.value} color="accent" text-color="warning" />
          <p class="font-weight-light">click to copy</p>
          <p class="text--darken-1 v-card__title justify-center align-center">Readonly Macaroon</p>
          { !!state.readOnlyMacaroonRaw 
            ? <v-btn
                class="info--text"
                color="warning"
                href={`data:application/octet-stream;base64,${readOnlyMacaroonB64.value}`}
                download="readonly.macaroon"
                title="readonly.macaroon"
                loading={state.loading}
              >
                Download Macaroon
              </v-btn>
            : <v-btn
                class="info--text"
                color="warning"
                onClick={createReadonlyMac}
                loading={state.loading}
              >
                Create Macaroon
              </v-btn>
          }
          <div>{ state.error }</div>
          <p>Hex:</p>
          <copy-pill class="text-break" text={readOnlyMacaroonHex.value}color="accent" text-color="warning" />
          <p class="font-weight-light">click to copy</p>
        </div>)
      }
      <a href="https://lightningjoule.com/faq" target="_blank">Joule Documentation.</a>
    </v-container>
  }
})

