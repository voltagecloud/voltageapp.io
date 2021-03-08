import { defineComponent, createElement } from '@vue/composition-api'

const h = createElement

export default defineComponent({
  layout: 'podcast',
  setup: () => {

    return () => <div>
      Placeholder podcast page
    </div>
  }
})

