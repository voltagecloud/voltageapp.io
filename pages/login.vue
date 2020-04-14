<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col cols="12" md="10" lg="7" xl="5">
        <base-material-card>
          <template v-slot:heading>
            <h2 class="font-weight-light">
              Login
            </h2>
          </template>
          <v-card-actions>
            <v-col cols="12">
              <v-form
                ref="loginForm"
                v-model="valid"
                @submit.prevent="login"
              >
                <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  label="Email"
                  required
                />
                <v-text-field
                  v-model="password"
                  :rules="passwordRules"
                  label="Password"
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showPassword ? 'text' : 'password'"
                  @click:append="showPassword = !showPassword"
                />
                <v-btn
                  type="submit"
                  :disabled="!valid"
                  color="primary"
                  light
                  class="mr-4"
                >
                  <span style="color: black;">Login</span>
                </v-btn>
                <nuxt-link to="register">
                  Dont have an account?
                </nuxt-link>
              </v-form>
            </v-col>
          </v-card-actions>
        </base-material-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import useAuthForm from '~/compositions/useAuthForm'
import useAuthentication from '~/compositions/useAuthentication'

export default defineComponent({
  layout: 'plain',
  middleware: 'assertUnAuthed',
  components: {
    // @ts-ignore
    BaseMaterialCard: () => import('~/components/core/MaterialCard.vue')
  },
  setup (_, { root: { $router }}) {
    const { valid, email, password, emailRules, passwordRules, showPassword } = useAuthForm()
    const { login: dispatchLogin } = useAuthentication()

    async function login () {
      try {
        console.log({ email, password })
        await dispatchLogin(email.value, password.value)
        $router.push('/')
      } catch (error) {
        console.log({ error })
      }
    }

    return {
      valid,
      email,
      password,
      emailRules,
      passwordRules,
      login,
      showPassword
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
