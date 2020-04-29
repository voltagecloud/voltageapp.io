import { ref, reactive } from '@vue/composition-api'
import { Settings } from '~/types/api'
import { createStore } from '~/store'
import { Address4, Address6 } from 'ip-address'

export default function useFormValidation () {
    // is form valid
    const valid = ref(null)
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
    const settings = ref<Settings>(Object.assign({}, createStore.settings))

    // generic validation
    const required = (v: string) => !!v || 'Value is required'
    const char6 = (v: string) => v.length > 6 || 'Must be longer than 6 characters'
    const validIP = (v: string[]) => v.length == 0 || v.every(e => {
        console.log({e})
        const ip4 = new Address4(e)
        const ip6 = new Address6(e)
        return ip4.isValid() || ip6.isValid()
    }) || 'Invalid IP Address'


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
        settings,
        form,
        validIP
    }
}