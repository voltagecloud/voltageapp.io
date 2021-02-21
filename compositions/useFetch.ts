import { ref } from '@vue/composition-api'
import voltageFetch from '~/utils/fetchClient'

export default function useFetch <T>(endpoint: string) {
  const data = ref<T|null>(null)
  const error = ref<Error|null>(null)
  const statusCode = ref<number>(0)
  const loading = ref(false)

  async function dispatch(opts: RequestInit) {
    loading.value = true
    const res = await voltageFetch(endpoint, opts)
    try {
      data.value = await res.json() as T
    } catch (e) {
      error.value = e
    } finally {
      statusCode.value = res.status
      loading.value = false
    }
  }


  return {
    data,
    error,
    statusCode,
    loading,
    dispatch
  }
}
