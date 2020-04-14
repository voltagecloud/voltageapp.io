import { ref, reactive } from '@vue/composition-api'

export default function useAuthForm () {
    // email logic
    const email = ref('')
    const emailRules = reactive([
        (v: string) => !!v || 'Email is required',
        (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
    ])

    // password logic
    const password = ref('')
    const confirmPassword = ref('')
    const passwordRules = reactive([
        (v: string) => v.length > 6 || 'Password must be longer than 6 characters'
    ])
    const confirmPasswordRules = reactive([
        (v: string) => v === password.value || 'Passwords must match'
    ])
    const showPassword = ref(false)

    // is form valid
    const valid = ref(false)

    return {
        email,
        emailRules,
        password,
        confirmPassword,
        passwordRules,
        confirmPasswordRules,
        showPassword,
        valid
    }
}