<template lang="pug">
v-dialog(max-width='800' :value='value' @input='update')
  template(v-if='useActivator' v-slot:activator='{ on }')
    v-btn(v-on='on' color='highlight' block).info--text {{activatorText}}
  v-card.text-center(style='padding: 20px;')
    v-card-text.display-1 Enter your node's password
    v-card-actions
      v-form(style='width: 100%' ref='form' v-model='valid' @submit.prevent='done')
        v-text-field(v-model='nodePassword' type='password' :rules='[char8]' :error-messages='cacheError')
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

    function done () {
      emit('done', nodePassword.value)
    }

    function update (v: boolean) {
      emit('input', v)
    }

    const cacheError = ref('')
    // @ts-ignore
    watch(() => props.error, (val) => { cacheError.value = val })
    watch(nodePassword, () => { cacheError.value = '' })
    return {
      char8,
      valid,
      form,
      nodePassword,
      done,
      update,
      cacheError
    }
  }
})
</script>
