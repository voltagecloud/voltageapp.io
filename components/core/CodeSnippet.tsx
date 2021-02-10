import { defineComponent, createElement } from '@vue/composition-api'
import useClipboard from '~/compositions/useClipboard'

const h = createElement

export default defineComponent({
  components: {
    VTooltip: () => import('vuetify/lib').then(m => m.VTooltip)
  },
  setup: (_, { slots }) => {

    const styles = {
      'text-align': 'left',
      overflow: 'scroll-y',
      'background-color': '#505050',
      'font-family': 'monospace',
      color: '#ffffff',
      'border-radius': '5px',
      'padding': '10px',
      'white-space': 'pre-wrap',       /* css-3 */
      'word-wrap': 'break-word',       /* Internet Explorer 5.5+ */
    }

    const { isCopied, copy } = useClipboard(2000)

    return () => <v-tooltip
      bottom
      scopedSlots={{
        // @ts-ignore
        activator: ({ attrs, on }) => <div style={styles} {...attrs} {...{ on }} onClick={() => { copy(slots.default()[0].text) }}>
          { slots.default() }
        </div>
      }}
    >
      <span>{isCopied.value ? 'Copied to Clipboard!' : 'Click to Copy'}</span>
    </v-tooltip>
  }
})

