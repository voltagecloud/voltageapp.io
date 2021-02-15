import { defineComponent, reactive, createElement } from '@vue/composition-api'
import JsonTable, { JsonData } from '~/components/core/JsonTable'
import useNodeApi from '~/compositions/useNodeApi'
import { VContainer, VRow, VCol, VCard } from 'vuetify/lib'

const h = createElement

export default defineComponent({
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  components: {
    VContainer, VRow, VCol, VCard
  },
  setup: (_, ctx) => {

    const { billing, loading } = useNodeApi(ctx.root.$nuxt.context)

    const state = reactive({
      data: null as null|JsonData,
      error: ''
    })

    billing().then(res => {
      if (!res) {
        state.error = 'an error occured fetching billing information'
        return 
      }
      state.data = res.data
      state.error = ''
    })

    return () => <v-container>
      <v-row justify="center">
        <v-col cols="12" lg="10">
          { state.error && <v-card class="pa-3">{state.error}</v-card> }
          { state.data  && <v-card color="info" class="pa-3" >
            <JsonTable data={() => state.data as JsonData}/>
          </v-card>}
        </v-col>
      </v-row>
    </v-container>
  }
})


