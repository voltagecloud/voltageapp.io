import { ref, computed } from '@vue/composition-api'

export function useConfirmPassword () {
  const password = ref('')
  const confirmPassword = ref('')
  const showPassword = ref(false)
  const inputType = computed(() => showPassword.value ? 'text' : 'password')
  const error = ref('')

  function handlePassword (v: string) {
    password.value = v
  }

  function handleConfirm (v: string) {
    confirmPassword.value = v
  }

  function validate () {
    if (password.value.length < 8) {
      error.value = 'Password must be at least 8 characters long'
      return
    }
    if (password.value !== confirmPassword.value) {
      error.value = 'Passwords must match'
      return
    }
    return true
  }


  return {
    password,
    confirmPassword,
    showPassword,
    inputType,
    handlePassword,
    handleConfirm,
    validate,
    error
  }
}
