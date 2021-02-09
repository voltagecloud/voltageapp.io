import { defineComponent, createElement, PropType, reactive, watchEffect } from '@vue/composition-api'
import useNodeApi from '~/compositions/useNodeApi'
import type { Node } from '~/types/apiResponse'


const h = createElement

export default defineComponent({
  components: {
    VContainer: () => import('vuetify/lib').then(m => m.VContainer),
    CopyPill: () => import('~/components/core/CopyPill.vue'),
    QrcodeVue: () => import('qrcode.vue')
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true
    }
  },
  setup: (props, ctx) => {
    const { sphinxConnString, loading } = useNodeApi(ctx.root.$nuxt.context)

    const state = reactive({
      connectionString: ''
    })

    async function getConnString () {
      const res = await sphinxConnString(props.node.node_id)
      if (res && res.data) {
        state.connectionString = res.data.connection_string
      }
    }
    getConnString()

    return () => <v-container class="text-center">
        <p class="font-weight-light text--darken-1 v-card__title justify-center align-center">Sphinx</p>
        { state.connectionString
          ? (<div>
            <copy-pill
              class="font-weight-light"
              text={state.connectionString}
              color="accent"
              text-color="warning"
            />
            <p class="font-weight-light">click to copy</p><br />
            <qrcode-vue value={state.connectionString} size="300" class="mx-auto" />
          </div>)
          : loading.value
          ? (<div>Fetching Sphinx conenction information</div>)
          : (<div>An error occured while fetching the spinx connection information</div>)
        }
    </v-container>
  }
})

