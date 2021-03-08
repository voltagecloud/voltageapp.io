import { defineComponent, PropType, computed } from '@vue/composition-api'
import type { Node } from '~/types/apiResponse'


export default defineComponent({
  components: {
    vChip: () => import('vuetify/lib').then(m => m.VChip),
    QrcodeVue: () => import('qrcode.vue'),
    CopyPill: () => import('~/components/core/CopyPill.vue'),
    VContainer: () => import('vuetify/lib').then(m => m.VContainer)
  },
  props: {
    connectUri: {
      type: String,
      required: true,
    },
    node: {
      type: Object as PropType<Node>,
      required: true
    }
  },
  setup: (props) => {
    const apiOff = computed(() => props.node.settings.grpc || props.node.settings.rest)

    const showCode = computed(() => apiOff.value && props.connectUri)
    return () => {


      return <v-container class="text-center">
        { !apiOff.value && <v-chip color="warning">
          Both APIs are off. To connect, please enable at least one API in your settings
        </v-chip> }
        { showCode.value && <div>
          <copy-pill
            class="font-weight-light"
            text={props.connectUri}
            color="accent"
            text-color="warning"
          />
          <p class="font-weight-light">click to copy</p><br />
          <qrcode-vue value={props.connectUri} size="300" class="mx-auto" />
        </div> }
      </v-container>
    }
  }
})
