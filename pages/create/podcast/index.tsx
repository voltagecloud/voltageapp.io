import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  components: {
    CreateNode: () => import('~/components/CreateNode.vue')
  },
  setup: () => {

    return () => <div>
      
    </div>
  }
})

