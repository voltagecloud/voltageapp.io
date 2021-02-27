import { voltageFetch } from '~/utils/fetchClient'
import crypto from 'crypto-js'

export default async function backupMacaroon (
  { macaroonText, macaroonType, nodeId, password }:
  { macaroonText: string, macaroonType: string; nodeId: string; password: string; }
) {
  const encrypted = crypto.AES.encrypt(macaroonText, password).toString()
  return await voltageFetch('/node/macaroon', {
    method: 'POST',
    body: JSON.stringify({
      node_id: nodeId,
      name: macaroonType,
      macaroon_data: encrypted
    })
  })
}
