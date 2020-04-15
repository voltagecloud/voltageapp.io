<template>
  <v-container style="height: 100%;">
    <v-row align="center" justify="center" style="height: 100%;">
      <v-col cols="12" md="10" lg="8" xl="6">
        <base-material-card title="Sign Up">
          <template v-slot:heading>
            <v-row justify="start">
              <v-icon
                class="mr-2"
                @click="$router.push('/')"
              >
                mdi-arrow-left
              </v-icon>
              <h2 class="font-weight-light">
                Register
              </h2>
            </v-row>
          </template>
          <v-card-actions>
            <v-col cols="12">
              <v-fade-transition mode="out-in">
                <v-form
                  v-if="currentStep === 0"
                  key="1"
                  ref="form"
                  v-model="valid"
                  @submit.prevent="register"
                  lazy-validation
                >
                  <v-text-field
                    v-model="email"
                    :rules="[required, validEmail]"
                    label="Email"
                    required
                  />
                  <v-text-field
                    v-model="password"
                    :rules="[char6]"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="showPassword ? 'text' : 'password'"
                    label="Password"
                    required
                    @click:append="showPassword = !showPassword"
                  />
                  <v-text-field
                    v-model="confirmPassword"
                    :rules="[char6, matchPassword]"
                    :type="showPassword ? 'text' : 'password'"
                    label="Confirm Password"
                    required
                  />
                  <v-btn
                    type="submit"
                    color="primary"
                    :disabled="!valid"
                    :loading="loading"
                  >
                    Register
                  </v-btn>
                  <v-spacer />
                  <a @click="currentStep += 1">Already have a confirmation code?</a>
                </v-form>
                <v-form
                  v-else
                  key="2"
                  ref="confirmForm"
                  v-model="valid"
                  @submit.prevent="confirm"
                  lazy-validation
                >
                  <v-text-field
                    v-model="email"
                    label="Email"
                    :rules="[required, validEmail]"
                    required
                  />
                  <v-text-field
                    v-model="confirmCode"
                    label="Confirmation Code"
                    :rules="[required]"
                    required
                  />
                  <v-btn
                    type="submit"
                    color="primary"
                    :disabled="!valid"
                    :loading="loading"
                  >
                    Confirm
                  </v-btn>
                  <v-spacer />
                  <a @click="resend(email)">Resend Code</a>
                </v-form>
              </v-fade-transition>
            </v-col>
          </v-card-actions>
        </base-material-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import useFormValidation from '~/compositions/useFormValidation'
import useAuthentication from '~/compositions/useAuthentication'

export default defineComponent({
  layout: 'plain',
  middleware: 'assertUnAuthed',
  components: {
    BaseMaterialCard: () => import('~/components/core/MaterialCard.vue')
  },
  setup (_, {root}) {
    const logic = useFormValidation()
    const currentStep = ref(0)

    const { register: registerApi, confirm: confirmApi, login, loading, resend } = useAuthentication()

    async function register () {
      await registerApi(logic.email.value, logic.password.value)
      currentStep.value += 1
      logic.valid.value = false
    }

    const confirmCode = ref('')

    async function confirm () {
      await confirmApi(logic.email.value, confirmCode.value)
      await login(logic.email.value, logic.password.value)
      root.$router.push('/')
    }

    return {
      ...logic,
      loading,
      resend,
      register,
      confirm,
      currentStep,
      confirmCode
    }
  }
})
</script>