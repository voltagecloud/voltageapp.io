<template lang="pug">
v-dialog(max-width='800' :value='value' @input='update')
  template(v-if='useActivator' v-slot:activator='{ on }')
    v-btn(v-on='on' color='highlight' block).info--text {{activatorText}}
  v-card.text-center(style='padding: 20px;')
    v-card-text.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
      | Enter the node's password
    v-card-actions
      v-form(style='width: 100%' ref='form' v-model='valid' @submit.prevent='done' :key='key')
        v-text-field(v-model='nodePassword' type='password' :rules='[char8]' :error-messages='newError')
        p.font-weight-light.text--darken-1.justify-center.align-center
          | This can take up to 30 seconds. Do not close your browser.
        v-btn(type='submit' :disabled='!valid' color='highlight' :loading='loading' block).info--text {{text}}
</template>
<script lang="ts">
import { defineComponent, watch, ref } from '@vue/composition-api'
import useFormValidation from '~/compositions/useFormValidation'

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
    text: {
      type: String,
      required: true
    },
    value: {
      type: Boolean,
      required: true
    },
    loading: {
      type: Boolean,
      required: false,
      default: false
    },
    error: {
      type: String,
      required: false
    }
  },
  setup (props, { emit }) {
    const { char8, valid, form, password: nodePassword } = useFormValidation()

    const key = ref(0)
    function done () {
      emit('done', nodePassword.value)
      // we clear the password after 3 seconds so the incorrect password
      // message still displays but we clear the password for next time.
      // nodePassword.value = ''
      // key.value++
      newError.value = props.error
    }

    function update (v: boolean) {
      emit('input', v)
    }

    const newError = ref(props.error)

    watch(() => props.error, (val) => { newError.value = val })
    watch(nodePassword, () => { newError.value = '' })
    watch(() => props.value, (cur) => {
      if (!cur) {
        nodePassword.value = ''
        key.value++
      }
    })
    return {
      char8,
      valid,
      form,
      nodePassword,
      done,
      update,
      newError,
      key
    }
  }
})
</script>
