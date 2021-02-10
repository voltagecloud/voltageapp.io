import { defineComponent, createElement, computed, watchEffect } from '@vue/composition-api'

const h = createElement

export default defineComponent({
  components: {
    VCheckbox: () => import('vuetify/lib').then(m => m.VCheckbox)
  },
  props: {
    cert: {
      type: String
    },
    value: {
      type: Boolean,
      required: true
    }
  },
  setup: (props, { emit }) => {
    const certMessage = computed(() => !props.cert ? 'Could not retrieve TLS certificate' : '')

    // make sure value is disabled if there is no cert
    watchEffect(() => {
      if (!props.cert) {
        emit('input', false)
      }
    })

    function update (event: boolean) {
      emit('input', event)
    }

    return () => <div>
      <v-checkbox
        label="Include TLS Certificate"
        disabled={!!certMessage.value}
        onChange={update}
        error-messages={certMessage.value}
      />
    </div>
  }
})

