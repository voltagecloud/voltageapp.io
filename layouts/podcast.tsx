import { defineComponent, createElement } from '@vue/composition-api'

const h = createElement

export default defineComponent({
  setup: () => {

    return () => <div>
      <nuxt />
    </div>
  }
})

