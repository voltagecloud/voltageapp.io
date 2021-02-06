import { defineComponent, createElement, PropType, computed } from '@vue/composition-api'
import { Node } from '~/types/apiResponse'
import useDecryptMacaroon from '~/compositions/useDecryptMacaroon'
import useBuildUri, { selectedApi, includeCert } from '~/compositions/useBuildUri'

const h = createElement

export default defineComponent({
  components: {
    BaseConnect: () => import('./BaseConnect'),
    ApiToggle: () => import('./ApiToggle'),
    CertToggle: () => import('./CertToggle'),
    VContainer: () => import('vuetify/lib').then(m => m.VContainer),
    VRow: () => import('vuetify/lib').then(m => m.VRow),
    VCol: () => import('vuetify/lib').then(m => m.VCol),
    VSpacer: () => import('vuetify/lib').then(m => m.VSpacer),
    VRadioGroup: () => import('vuetify/lib').then(m => m.VRadioGroup),
    VCheckbox: () => import('vuetify/lib').then(m => m.VCheckbox),
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true
    }
  },
  setup: (props, ctx) => {
    const { macaroon, apiEndpoint, cert } = useDecryptMacaroon(ctx, props.node.node_id)
    const { uri } = useBuildUri({
      endpoint: apiEndpoint,
      macaroon,
      cert,
      api: selectedApi
    })

    console.log({ uri })

    return () => {

      return <div>
        <p class="font-weight-light text--darken-1 v-card__title justify-center align-center">LNDConnect</p>
        <base-connect connectUri={uri.value} node={props.node} />
        <v-container>
            <v-row align="center" justify="space-between">
              <v-col cols="6" class="d-flex flex-column align-center">
                <api-toggle value={selectedApi.value} onInput={(val: 'GRPC'|'REST') => { console.log(val); selectedApi.value = val }} node={props.node} />
              </v-col>
              <v-spacer></v-spacer>
              <v-col cols="6" class="d-flex flex-column align-center">
                <cert-toggle value={includeCert.value} onInput={(val: boolean) => includeCert.value = val } cert={cert.value} />
              </v-col>
            </v-row>
        </v-container>
      </div>
    }
  }
})

