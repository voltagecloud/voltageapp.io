import { ref, reactive } from '@vue/composition-api'
import { Address4, Address6 } from 'ip-address'
import { Settings } from '~/types/api'
import { createStore } from '~/store'

export default function useFormValidation () {
  // is form valid
  const valid = ref<null|boolean>(null)
  const form = ref<HTMLFormElement|null>(null)

  // email logic
  const email = ref('')
  const validEmail = (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid'

  // password logic
  const password = ref('')
  const confirmPassword = ref('')
  const matchPassword = (v: string) => v === password.value || 'Passwords must match'
  const showPassword = ref(false)

  // node creation
  const settings = reactive<Settings>(Object.assign({}, createStore.settings))

  // generic validation
  const required = (v: string) => !!v || 'Value is required'
  const char6 = (v: string) => v.length >= 6 || 'Must be at least 6 characters'
  const char8 = (v: string) => v.length >= 8 || 'Must be at least 8 characters'
  const validIP = (v: string[]) => v.length === 0 || v.every((e) => {
    const ip4 = new Address4(e)
    const ip6 = new Address6(e)
    return ip4.isValid() || ip6.isValid()
  }) || 'Invalid IP Address'

  function remove (settings: Settings, item: Address4|Address6) {
    settings.whitelist = settings.whitelist.filter(elem => elem !== item)
  }

  const showPalette = ref(false)

  function invertColor (hex: string) {
    if (hex.indexOf('#') === 0) {
      hex = hex.slice(1)
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    }
    if (hex.length !== 6) {
      console.log('Invalid HEX color.')
      return '#FFFFFF'
    }
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    // if (bw) {
    // http://stackoverflow.com/a/3943023/112731
    return (r * 0.299 + g * 0.587 + b * 0.114) > 186
      ? '#000000'
      : '#FFFFFF'
    // }
    // // invert color components
    // r = (255 - r).toString(16);
    // g = (255 - g).toString(16);
    // b = (255 - b).toString(16);
    // // pad each with zeros and return
    // return "#" + padZero(r) + padZero(g) + padZero(b);
  }
  // function padZero(str: string, len: number) {
  //   len = len || 2
  //   var zeros = new Array(len).join('0')
  //   return (zeros + str).slice(-len)
  // }

  return {
    email,
    required,
    validEmail,
    password,
    confirmPassword,
    char6,
    char8,
    matchPassword,
    showPassword,
    valid,
    settings,
    form,
    validIP,
    remove, // function to remove items from combobox
    showPalette,
    invertColor
  }
}
