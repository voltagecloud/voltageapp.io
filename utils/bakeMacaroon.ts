interface Permission {
  entity: string;
  action: string;
}

export enum MacaroonType {
  btcpayserver = 'btcpayserver',
}


const macaroonPermissions: Record<MacaroonType, { permissions: Permission[] }> = {
  btcpayserver: {
    permissions: [
      {
        entity: 'info',
        action: 'read'
      },
      {
        entity: 'address',
        action: 'read'
      },
      {
        entity: 'address',
        action: 'write'
      },
      {
        entity: 'onchain',
        action: 'read'
      },
      {
        entity: 'invoices',
        action: 'read'
      },
      {
        entity: 'invoices',
        action: 'write'
      }
    ]
  }
}

export async function bakeMacaroon (
  { endpoint, macaroonType, macaroonHex }:
  { endpoint: string; macaroonType: MacaroonType; macaroonHex: string }
) {
  return await fetch(`https://${endpoint}:8080/v1/macaroon`, {
    method: 'POST',
    body: JSON.stringify(macaroonPermissions[macaroonType]),
    headers: {
      'Grpc-Metadata-Macaroon': macaroonHex
    }
  })
}
