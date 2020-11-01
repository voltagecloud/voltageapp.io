<template lang="pug">
  v-container(style='height: 100%;')
    v-row(align='center' justify='center' style='height: 100%;')
      v-col(cols='12' md='10' lg='8' xl='6')
        base-material-card(title='Sign Up')
          template(v-slot:heading='')
            h2.font-weight-light
              | Reset Password
          v-card-text(v-if='currentStep === 1') We sent a password reset code to your email.
          v-card-actions
            v-col(cols='12')
              v-fade-transition(mode='out-in')
                v-form(v-if='currentStep === 0' key='1' ref='form' v-model='valid' @submit.prevent='handleForm1')
                  v-text-field(v-model='email' :rules='[required, validEmail]' label='Email' required)
                  v-col(cols='12' v-if='error').error--text
                    | {{ error.message }}
                  v-btn(type='submit' color='primary' :disabled='!valid' :loading='loading').mr-3
                    | Request Reset
                  a(@click='currentStep += 1') Use Existing Code
                  a   |
                  a(@click='$router.push("/login")') Login
                v-form(v-else key='2' ref='confirmForm' v-model='valid' @submit.prevent='handleForm2')
                  v-text-field(v-model='email' label='Email' :rules='[required, validEmail]' required='')
                  v-text-field(v-model='code' label='Confirmation Code' :rules='[required]' required='')
                  v-text-field(v-model='password' :rules='[char6, required]' :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :type="showPassword ? 'text' : 'password'" label='Password' required @click:append='showPassword = !showPassword')
                  v-text-field(v-model='confirmPassword' :rules='[char6, matchPassword, required]' :type="showPassword ? 'text' : 'password'" label='Confirm Password' required)
                  v-col(cols='12' v-if='error').error--text
                    | {{ error.message }}
                  v-btn(type='submit' color='primary' :disabled='!valid' :loading='loading').mr-3
                    | Reset
                  a(@click='$router.push("/login")') Back to Login
</template>
<script lang="ts">
import { defineComponent, ref, watch } from '@vue/composition-api'
import useFormValidation from '~/compositions/useFormValidation'
import useAuthentication from '~/compositions/useAuthentication'

export default defineComponent({
  layout: 'plain',
  middleware: ['loadCognito', 'assertUnAuthed'],
  components: {
    BaseMaterialCard: () => import('~/components/core/MaterialCard.vue')
  },
  setup (_, { root }) {
    const { validEmail, email, password, confirmPassword, valid, required, char6, showPassword, matchPassword } = useFormValidation()

    const code = ref('')

    const { forgotPassword, confirmNewPassword, loading, login, error } = useAuthentication()

    const currentStep = ref(0)

    const form = ref<HTMLFormElement|null>(null)
    const confirmForm = ref<HTMLFormElement|null>(null)

    async function handleForm1 () {
      // set error to none so when retrying it will reset the error
      error.value = ''
      await forgotPassword(email.value.trim())
      if (error.value === '') {
        currentStep.value += 1
        valid.value = false
      }
    }

    async function handleForm2 () {
      await confirmNewPassword(email.value.trim(), code.value, confirmPassword.value)
      await login(email.value.trim(), confirmPassword.value)
      root.$router.push('/')
    }

    watch(() => password.value, () => { error.value = '' })
    watch(() => confirmPassword.value, () => { error.value = '' })
    watch(() => email.value, () => { error.value = '' })
    watch(() => code.value, () => { error.value = '' })

    return {
      email,
      validEmail,
      password,
      confirmPassword,
      currentStep,
      form,
      confirmForm,
      handleForm1,
      handleForm2,
      valid,
      required,
      loading,
      char6,
      code,
      showPassword,
      matchPassword,
      error
    }
  }
})
</script>
