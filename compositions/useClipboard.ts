import { ref } from '@vue/composition-api'
import copy, * as cp from 'copy-to-clipboard'

export default function useClipboard (timeout?: number) {
  const isCopied = ref(false)

  function copy (val: string) {
    // @ts-ignore
    cp(val)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, timeout || 0)
  }

  return {
    copy,
    isCopied
  }
}
