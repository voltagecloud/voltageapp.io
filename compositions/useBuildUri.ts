import type { Ref } from '@vue/composition-api'
import { ref, computed } from '@vue/composition-api'
import { buildUri } from '~/utils/buildUri'

// shared state between connect components which supoprt both apis
export const selectedApi = ref('GRPC') as Ref<'GRPC'|'REST'>
export const includeCert = ref(false)

export default function useBuildUri (
  { endpoint, api, cert, macaroon }:
  { endpoint: Ref<string>; api: Ref<'GRPC'|'REST'>; cert: Ref<string>; macaroon: Ref<string> }
) {
  const uri = computed(() => buildUri({
    endpoint: endpoint.value,
    api: api.value,
    cert: includeCert.value ? cert.value : '',
    macaroon: macaroon.value
  }))

  return {
    uri
  }
}
