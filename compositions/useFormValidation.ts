import { ref, reactive } from '@vue/composition-api'
import { Settings } from '~/types/api'
import { createStore } from '~/store'

export default function useFormValidation () {
    // is form valid
    const valid = ref(false)
    const form = ref(null)

    // email logic
    const email = ref('')
    const validEmail = (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
    

    // password logic
    const password = ref('')
    const confirmPassword = ref('')
    const matchPassword = (v: string) => v === password.value || 'Passwords must match'
    const showPassword = ref(false)

    // node creation
    const nodeName = ref('')
    const settings = ref<Settings>(Object.assign({}, createStore.settings))

    // generic validation
    const required = (v: string) => !!v || 'Value is required'
    const char6 = (v: string) => v.length > 6 || 'Must be longer than 6 characters'


    return {
        email,
        required,
        validEmail,
        password,
        confirmPassword,
        char6,
        matchPassword,
        showPassword,
        valid,
        nodeName,
        settings,
        form
    }
}