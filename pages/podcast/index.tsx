import { defineComponent } from '@vue/composition-api'
import PodcastLanding from '~/components/PodcastLanding'

export default defineComponent({
  setup: () => {

    return () => <PodcastLanding />
  }
})

