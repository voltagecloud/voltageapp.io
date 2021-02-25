import { defineComponent, PropType, computed, createElement } from '@vue/composition-api'
import CopyPill from '~/components/core/CopyPill.vue'
import { VSimpleTable } from 'vuetify/lib'

const h = createElement

type Primitive = String|Number|Boolean
type JsonObject = Record<string, Primitive|JsonArray>
type JsonArray = Array<Primitive|JsonObject>
export type JsonData = Primitive|JsonObject|JsonArray


export default defineComponent({
  name: 'json-table',
  components: {
    'v-simple-table': VSimpleTable
  },
  props: {
    data: {
      type: Function as PropType<() => JsonData>,
      required: false,
      //validator: (prop) => {
      //  let validJson = false
      //  try {
      //    const res = JSON.stringify(prop())
      //    validJson = !!res
      //  } catch {
      //    validJson = false
      //  }
      //  return validJson
      //}
    }
  },
  setup: (props, { root, slots }) => {
    const data = computed(() => props.data ? props.data() : null)

    return () => {
      const dataType = typeof data.value
      if (dataType === 'string' || dataType === 'number' || dataType === 'boolean') {
        return (
          <CopyPill
            color="accent"
            text-color="warning"
            text={`${data.value}`}
            class="mr-3"
          />
        )
      } else if (data.value === null) {
        return null
      } else if (data.value instanceof Array) {
        return (
          <v-simple-table
            style={{'background-color': root.$vuetify.theme.currentTheme.secondary}}
          >
            <tbody>
              {data.value.map((elem, i) => (
                <tr>
                  <td class="text-end">
                    <json-table data={() => elem} />
                  </td>
                </tr>
              ))}
            </tbody>
          </v-simple-table>
        )
      } else {
        return (
          <v-simple-table
            style={{'background-color': root.$vuetify.theme.currentTheme.secondary}}
          >
            <tbody>
              {Object.entries(data.value).map(([key, val]) => (
                <tr>
                  <td>
                    <div>{key}</div>
                  </td>
                  <td class="text-end" style="max-width: 40vw;">
                    <json-table data={() => val} />
                  </td>
                </tr>
              ))}
              { slots.default() }
            </tbody>
          </v-simple-table>
        )
      }
    }
  }
})
