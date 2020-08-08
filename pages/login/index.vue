<template lang="pug">
  v-container
    v-row(justify='center' align='center')
      v-col(cols='12' md='10' lg='7' xl='5')
        base-material-card
          template(v-slot:heading='')
            h2.font-weight-light
              | Login
          v-card-actions
            v-col(cols='12')
              v-form(v-if='!showMFA' key='0' v-model='valid' @submit.prevent='login')
                v-text-field(v-model='email' :rules='[required, validEmail]' label='Email' required='')
                v-text-field(
                  v-model='password'
                  :rules='[char6]'
                  label='Password'
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showPassword ? 'text' : 'password'"
                  @click:append='showPassword = !showPassword'
                )
                v-col(cols='12' v-if='error').error--text
                  | {{ error.message || error }}
                v-btn.mr-4(type='submit' :disabled='!valid' color='primary' light='' :loading='loading')
                  span.warning--text Login
                a(@click='$router.push("/register")')
                  | Dont have an account?
                a(@click='$router.push("/forgot")').ml-3 Forgot Password?
              v-form(v-else v-model='valid' @submit.prevent='confirm' key='1')
                v-text-field(
                  v-model='code'
                  label='MFA Code'
                  :rules='[char6]'
                )
                v-col(cols='12' v-if='error').error--text
                  | {{ error.message || error }}
                v-btn.mr-4(type='submit' :disabled='!valid' color='primary' light :loading='loading')
                  span.warning--text Confirm
</template>
<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import useFormValidation from '~/compositions/useFormValidation'
import useAuthentication from '~/compositions/useAuthentication'

export default defineComponent({
  layout: 'plain',
  middleware: ['loadCognito', 'assertUnAuthed', 'assertInvited'],
  components: {
    BaseMaterialCard: () => import('~/components/core/MaterialCard.vue')
  },
  setup (_, { root: { $router } }) {
    const { valid, email, password, required, validEmail, char6, showPassword } = useFormValidation()
    const { login: dispatchLogin, loading, error, showMFA, confirmLogin } = useAuthentication()

    async function login () {
      try {
        await dispatchLogin(email.value, password.value)
        console.log('show value')
        if (!showMFA.value) {
          $router.push('/')
        }
      } catch (error) {
        console.log({ error })
      }
    }

    const code = ref('')
    async function confirm () {
      try {
        await confirmLogin(code.value)
        $router.push('/')
      } catch (error) {
        console.log({ error })
      }
    }

    return {
      valid,
      email,
      password,
      required,
      validEmail,
      char6,
      login,
      showPassword,
      loading,
      error,
      showMFA,
      confirm,
      code
    }
  }
})

//   data () {
//     return {
//       form: {
//         email: '',
//         password: ''
//       },
//       valid: false,
//       show: false,
//       rules: {
//         email: [
//           v => !!v || 'E-mail is required',
//           v => /.+@.+\..+/.test(v) || 'E-mail must be valid'
//         ],
//         password: [
//           // TODO add password validation
//         ]
//       }
//     }
//   },
//   methods: {
//     async login () {
//       try {
//         await this.$store.dispatch('auth/login', this.form)
//         this.$router.push('/')
//       } catch (error) {
//         console.log({ error })
//       }
//     }
//   }
// }
</script>
