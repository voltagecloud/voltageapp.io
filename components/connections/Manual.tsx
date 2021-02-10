import { defineComponent, createElement, PropType, watchEffect, reactive, computed } from '@vue/composition-api'
import { Node } from '~/types/apiResponse'
import useDecryptMacaroon from '~/compositions/useDecryptMacaroon'

const h = createElement

export default defineComponent({
  components: {
    VBtn: () => import('vuetify/lib').then(m => m.VBtn),
    CopyPill: () => import('~/components/core/CopyPill.vue')
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true
    }
  },
  setup: (props, ctx) => {
    const { apiEndpoint, macaroonHex, macaroon, cert } = useDecryptMacaroon(ctx, props.node.node_id)

    const certButtonText = computed(() => cert.value === 'pending' && cert.value
      ? 'Certificate is Pending'
      : 'Download Certificate'
    )

    return () => <div class="text-center">
      <p class="font-weight-light text--darken-1 v-card__title justify-center align-center">Manual</p>
      <p>
        Need to connect to an app not listed here?
        Get everything you need to connect below.
      </p>
      <p>API Endpoint</p>
      <copy-pill class="text-break" text={apiEndpoint.value} color="accent" text-color="warning"></copy-pill>
      <p class="font-weight-light">click to copy</p>
      <p></p>Macaroon<p></p>
      <v-btn
        class="info--text"
        color="warning"
        text-color="highlight"
        href={`data:application/text-plain;base64,${macaroon.value}`}
        download="admin.macaroon"
        title="admin.macaroon">Download Macaroon</v-btn>
      <p></p>
      <p>Macaroon Hex:<copy-pill class="text-break" text={macaroonHex.value} color="accent" text-color="warning"></copy-pill>
      <p class="font-weight-light">click to copy</p>
      </p>
      <p></p>TLS Certificate<p></p>
      <v-btn
        class="info--text"
        color="warning"
        href={`data:application/text-plain;base64,${cert.value}`}
        download="tls.cert"
        title="tls.cert"
      >{certButtonText.value}</v-btn>
    </div>
  }
})

