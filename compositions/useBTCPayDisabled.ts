import { computed } from '@vue/composition-api'
import useFetch from '~/compositions/useFetch'

export default function useBTCPayDisabled () {
  const { dispatch, data, loading } = useFetch<any>('/btcpayserver')
  dispatch({ method: 'GET' })

  const { dispatch: userDispatch, data: userData, loading: userLoading } = useFetch<any>('/user')
  userDispatch({ method: 'GET' })

  const alreadyHasIntance = computed(() => !!data.value?.btcpayservers?.find((server: any) =>
    server.purchase_status !== 'trial'
  ))

  const hasAvailable = computed(() => !!userData.value?.available_btcpayservers
    || userData.value.btcpayserver_trial
  )

  const mergedLoading = computed(() => loading.value || userLoading.value || !data.value)

  const canPurchase = computed(() => !mergedLoading.value && !hasAvailable.value && !alreadyHasIntance.value)
  const canCreate = computed(() => !mergedLoading.value && hasAvailable.value && !alreadyHasIntance.value)

  console.log({ data, userData })

  return {
    loading: mergedLoading,
    canPurchase,
    canCreate
  }
}
