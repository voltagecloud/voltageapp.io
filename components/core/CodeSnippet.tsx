import { defineComponent, createElement } from '@vue/composition-api'

const h = createElement

export default defineComponent({
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

    return () => <div style={styles} >
      { slots.default() }
    </div>
  }
})

