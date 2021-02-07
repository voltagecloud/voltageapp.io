import { defineComponent, createElement, PropType, reactive, watchEffect } from '@vue/composition-api'
import useNodeApi from '~/compositions/useNodeApi'
import type { Node } from '~/types/apiResponse'


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
    const { sphinxConnString, loading } = useNodeApi(ctx.root.$nuxt.context)

    const state = reactive({
      connectionString: ''
    })

    watchEffect(async () => {
      const res = await sphinxConnString(props.node.node_id)
    })

    return () => <v-container clas="text-center">
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

