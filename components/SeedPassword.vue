<template lang="pug">
  v-form(v-model='valid' @submit.prevent='getMacaroon' ref='form')
    v-text-field(
      v-model='password'
      :rules='[required]'
      label='Password'
      :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
      :type="showPassword ? 'text' : 'password'"
      required
      @click:append='showPassword = !showPassword'
    )
    v-text-field(
      v-model='confirmPassword'
      :rules='[char8, matchPassword, required]'
      :type="showPassword ? 'text' : 'password'"
      label='Confirm New Password'
      required
    )
    v-btn(type='submit' :disabled='!valid' block).warning--text Create Macaroon
</template>
<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import axios from 'axios'
import useFormValidation from '~/compositions/useFormValidation'
import { lndStore } from '~/store'

export default defineComponent({
  setup (_, context) {
    const loading = ref(false)
    async function getMacaroon () {
      loading.value = true
      const res = await axios({
        method: 'POST',
        url: lndStore.currentNode + '/v1/initwallet',
        data: {
          wallet_password: btoa(formState.password.value), // b64 encode password string
          cipher_seed_mnemonic: lndStore.cipher_seed_mnemonic,
          stateless_init: true
        }
      })
      console.log({ res })
      lndStore.MACAROON(res.data.admin_macaroon)
      context.emit('next')
    }

    const formState = useFormValidation()

    return {
      getMacaroon,
      ...formState
    }
  }
})
</script>