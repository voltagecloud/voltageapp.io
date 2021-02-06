// convert b64 to b64url
function safeUrl (data: string) {
  data = data.replace(/\+/g, '-')
  data = data.replace(/\//g, '_')
  data = data.replace(/=/g, '')
  return data
}

export function buildUri (
  { endpoint, api, cert, macaroon }:
  { endpoint: string; api: 'GRPC'|'REST'; cert: string; macaroon: string; }
) {
  if (!api) { return '' }
  const macaroonUrl = safeUrl(macaroon)
  const port = (api === 'GRPC')
    ? 10009
    : 8080
  return (cert)
    ? `lndconnect://${endpoint}:${port}?cert=${cert}&macaroon=${macaroonUrl}`
    : `lndconnect://${endpoint}:${port}?macaroon=${macaroonUrl}`
}
