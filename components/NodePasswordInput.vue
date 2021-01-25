<template lang="pug">
v-card.text-center(style='padding: 20px;')
  v-card-text.font-weight-light.text--darken-1.v-card__title.justify-center.align-center
    | Enter the node's password
  v-card-actions
    v-form(style='width: 100%' ref='form' v-model='valid' @submit.prevent='done')
      v-text-field(v-model='nodePassword' type='password' placeholder='Password' :rules='[char8]' :error-messages='newError')
      v-btn(type='submit' :disabled='!valid' color='highlight' :loading='loading' block).info--text {{text}}
</template>
<script lang="ts">
import { defineComponent, ref, watch } from '@vue/composition-api'
import useFormValidation from '~/compositions/useFormValidation'

export default defineComponent({
  props: {
    loading: {
      type: Boolean,
      required: false,
      default: false
    },
    error: {
      type: String,
      required: false
    },
    text: {
      type: String,
      required: true
    }
  },
  setup (props, { emit }) {
    const { char8, valid, form, password: nodePassword } = useFormValidation()

    function done () {
      if (nodePassword.value.length < 8) {
        newError.value = 'Password must be at least 8 characters'
        return
      }
      emit('done', nodePassword.value)
      // we clear the password after 3 seconds so the incorrect password
      // message still displays but we clear the password for next time.
      // nodePassword.value = ''
      // key.value++
      newError.value = props.error
    }

    const newError = ref(props.error)

    watch(() => props.error, (val) => { newError.value = val })
    watch(nodePassword, () => { newError.value = '' })

    return {
      char8,
      valid,
      form,
      nodePassword,
      done,
      newError
    }
  }
})
</script>
