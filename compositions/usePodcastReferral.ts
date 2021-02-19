import { NodeStatus } from '~/types/api'
import { watchEffect, Ref } from '@vue/composition-api'
import { nodeStore } from '~/store'
import useFetch from '~/compositions/useFetch'

export default function usePodcastReferral(
  { nodeId, podcastCode, macaroonHex }:
  { nodeId: string; podcastCode: string; macaroonHex: Ref<string> })
{
  const { dispatch, data } = useFetch<any>('/_custom/podcast')

  if (!!podcastCode) {
    watchEffect(async () => {
      const thisNode = nodeStore.nodes.find((node) => {
        node.node_id === nodeId
      })
      // watch for this nodes status to be running and macaroon state to be set
      if (!macaroonHex.value || !thisNode || thisNode.status !== NodeStatus.running) return
      const res = await fetch(`https://${thisNode.api_endpoint}:8080/v1/getinfo`, {
        method: 'GET',
        headers: new Headers({
          'Grpc-Metadata-macaroon': macaroonHex.value,
          'Content-Type': 'application/json'
        })
      })
      // get pubkey from getinfo call
      const { identity_pubkey: pubkey } = await res.json()
      await dispatch({
        body: JSON.stringify({
          podcast_id: podcastCode,
          pubkey
        })
      })
      console.log({ d: data.value })
    })
  }
}
