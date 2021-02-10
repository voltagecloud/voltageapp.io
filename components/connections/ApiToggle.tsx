import { defineComponent, createElement, PropType, computed, watchEffect } from '@vue/composition-api'
import type { Node } from '~/types/apiResponse'

const h = createElement

export default defineComponent({
  components: {
    VRadio: () => import('vuetify/lib').then(m => m.VRadio),
    VRadioGroup: () => import('vuetify/lib').then(m => m.VRadioGroup)
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true
    },
    value: {
      type: String as PropType<'GRPC'|'REST'|''>,
      required: true
    }
  },
  setup: (props, { emit }) => {
    function update (event: 'GRPC'|'REST') {
      console.log({update: event})
      emit('input', event)
    }
    const grpcMessage = computed(() => !props.node.settings.grpc ? 'GRPC is disabled' : '')
    const restMessage = computed(() => !props.node.settings.rest ? 'REST is disabled' : '')

    const combinedMessage = computed(() => [grpcMessage.value, restMessage.value].filter((e) => !!e))
    console.log({combined: combinedMessage.value})

    // make sure values are disabled if corresponding api is disabled
    watchEffect(() => {
      if (!props.node.settings.grpc && props.value === 'GRPC') {
        emit('input', '')
      }
      if (!props.node.settings.rest && props.value === 'REST') {
        emit('input', '')
      }
    })

    return () => <v-radio-group onChange={update} value={props.value} >
      <v-radio
        value="GRPC"
        key="GRPC"
        disabled={!!grpcMessage.value}
        label={grpcMessage.value || 'gRPC'}
        class="no-select"
      />
      <v-radio
        value="REST"
        key="REST"
        disabled={!!restMessage.value}
        label={restMessage.value || 'REST'}
        class="no-select"
      />
    </v-radio-group>
  }
})

