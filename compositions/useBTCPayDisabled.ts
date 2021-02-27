import { computed } from '@vue/composition-api'
import useFetch from '~/compositions/useFetch'

export default function useBTCPayDisabled () {
  const { dispatch, data, loading } = useFetch<any>('/btcpayserver')
  dispatch({ method: 'GET' })

  const { dispatch: userDispatch, data: userData, loading: userLoading } = useFetch<any>('/user')
  userDispatch({ method: 'GET' })

  const btcpayDisabled = computed(() => {
    if (!data.value || loading.value || userLoading.value) return true
    const alreadyHasInstance = !!data.value.btcpayservers.find((server: any) => server.purchase_status !== 'trial')
    const hasAvailable = !!userData.value?.available_btcpayservers
    return alreadyHasInstance || hasAvailable
  })

  const mergedLoading = computed(() => loading.value || userLoading.value)

  return {
    btcpayDisabled,
    loading: mergedLoading
  }
}
