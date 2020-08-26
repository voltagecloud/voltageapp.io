<template lang="pug">
  v-card(color='secondary')
    v-card-title Change Password
    v-card-actions.text-center
      v-form(v-model='valid' @submit.prevent='changePassword')
        v-text-field(
          v-model='oldPassword'
          :rules='[required]'
          label='Old Password'
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          @click:append='showPassword = !showPassword'
        )
        v-text-field(
          v-model='password'
          :rules='[char6, required]'
          label='New Password'
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          required
          @click:append='showPassword = !showPassword'
          :error-messages='error'
        )
        v-text-field(
          v-model='confirmPassword'
          :rules='[char6, matchPassword, required]'
          :type="showPassword ? 'text' : 'password'"
          label='Confirm New Password'
          required
        )
        v-btn(type='submit' :disabled='!valid' block color='secondary').warning--text Change Password
</template>
<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import Auth from '@aws-amplify/auth'
import useFormValidation from '~/compositions/useFormValidation'
import { authStore } from '~/store'

export default defineComponent({
  setup (_, { emit }) {
    const { char6, required, matchPassword, password, confirmPassword, form, valid, showPassword } = useFormValidation()

    const error = ref('')
    const oldPassword = ref('')
    async function changePassword () {
      if (authStore.user) {
        const user = await Auth.currentAuthenticatedUser()
        try {
          const res = await Auth.changePassword(user, oldPassword.value, password.value)
          console.log({ res })
          emit('done')
        } catch (err) {
          console.error({ err })
          error.value = err.message
        }
      }
    }
    return {
      oldPassword,
      password,
      confirmPassword,
      showPassword,
      char6,
      required,
      matchPassword,
      form,
      valid,
      changePassword,
      error
    }
  }
})
</script>