<template lang="pug">
  v-container(style='height: 100%;')
    v-row(align='center' justify='center' style='height: 100%;')
      v-col(cols='12' md='10' lg='8' xl='6')
        base-material-card(title='Sign Up')
          template(v-slot:heading='')
            h2.font-weight-light
              | Register
          v-card-text(v-if='currentStep === 1') We sent a confirmation code to your email.
          v-card-actions
            v-col(cols='12')
              v-fade-transition(mode='out-in')
                v-form(v-if='currentStep === 0' key='1' ref='form' v-model='valid' @submit.prevent='register')
                  v-text-field(v-model='email' :rules='[required, validEmail]' label='Email' required='')
                  v-text-field(v-model='password' :rules='[char6, required]' :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :type="showPassword ? 'text' : 'password'" label='Password' required @click:append='showPassword = !showPassword')
                  v-text-field(v-model='confirmPassword' :rules='[char6, matchPassword, required]' :type="showPassword ? 'text' : 'password'" label='Confirm Password' required)
                  v-col(cols='12' v-if='error').error--text
                    | {{ error }}
                  p.font-weight-light(style='font-size: 12px;')
                    | By creating an account you agree to our
                    a(href="https://getvoltage.io/terms.html" target="_blank") Terms of Service.
                  v-btn(type='submit' color='primary' :disabled='!valid' :loading='loading').mr-3
                    | Register
                  a(@click='currentStep += 1') Use Existing Code
                  a   |
                  a(@click='$router.push("/login")') Login
                v-form(v-else='' key='2' ref='confirmForm' v-model='valid' @submit.prevent='confirm')
                  v-text-field(v-model='email' label='Email' :rules='[required, validEmail]' required='')
                  v-text-field(v-model='confirmCode' label='Confirmation Code' :rules='[required]' required='')
                  v-col(cols='12' v-if='error').error--text
                    | {{ error }}
                  v-btn(type='submit' color='primary' :disabled='!valid' :loading='loading').mr-3
                    | Confirm
                  a(@click='resend(email)') Resend Code
                  a   |
                  a(@click='currentStep = 0') Register
</template>
<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import useFormValidation from '~/compositions/useFormValidation'
import useAuthentication from '~/compositions/useAuthentication'

export default defineComponent({
  layout: 'plain',
  components: {
    BaseMaterialCard: () => import('~/components/core/MaterialCard.vue')
  },
  setup (_, { root }) {
    const logic = useFormValidation()
    const currentStep = ref(0)

    const { register: registerApi, confirm: confirmApi, login, loading, resend, error } = useAuthentication()

    async function register () {
      // set error to none so when retrying it will reset the error
      error.value = ''
      await registerApi(logic.email.value.trim(), logic.password.value)
      if (error.value === '') {
        currentStep.value += 1
        logic.valid.value = null
      }
    }

    const confirmCode = ref('')

    async function confirm () {
      // set error to none so when retrying it will reset the error
      error.value = ''
      await confirmApi(logic.email.value.trim(), confirmCode.value)
      if (error.value === '') {
        await login(logic.email.value.trim(), logic.password.value)
        root.$router.push('/')
      }
    }

    return {
      ...logic,
      loading,
      resend,
      register,
      confirm,
      currentStep,
      confirmCode,
      error
    }
  }
})
</script>
