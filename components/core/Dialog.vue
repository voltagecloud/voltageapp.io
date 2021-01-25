<template lang="pug">
v-dialog(max-width='800' :value='value' @input='update')
  template(v-if='useActivator' v-slot:activator='{ on }')
    v-btn(v-on='on' color='highlight' block).info--text {{activatorText}}
  slot
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  props: {
    useActivator: {
      type: Boolean,
      required: false,
      default: false
    },
    activatorText: {
      type: String,
      required: false
    },
    value: {
      type: Boolean,
      required: true
    }
  },
  setup (_, { emit }) {
    function update (v: boolean) {
      emit('input', v)
    }

    return {
      update
    }
  }
})
</script>
