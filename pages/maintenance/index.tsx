import { defineComponent, createElement } from '@vue/composition-api'
import { VCard, VContainer, VRow, VCol } from 'vuetify/lib'

const h = createElement

export default defineComponent({
  components: {
    VCard, VRow, VCol, VContainer
  },
  layout: 'plain',
  setup: () => {
    return () => <v-container>
      <v-row justify="center" align="center" >
        <v-col cols="12" sm="8">
          <v-card>
            <v-container>
              <v-row justify="center" align="center" class="text-center">
                <v-col cols="12">
                  Voltage is currently under maintenance
                </v-col>
                <v-col cols="12">
                  This won't take long. Please check back soon!
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  }
})
