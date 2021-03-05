import { voltageFetch } from "~/utils/fetchClient";
import { isBase64, hexToBase64 } from '~/utils/crypto'
import crypto from "crypto-js";

interface Permission {
  entity: string;
  action: string;
}

export enum MacaroonType {
  btcpayserver = "btcpayserver",
  readonly = "readonly",
  admin = "admin",
}

const macaroonPermissions: Record<
  MacaroonType,
  { permissions: Permission[] }
> = {
  btcpayserver: {
    permissions: [
      {
        entity: "info",
        action: "read",
      },
      {
        entity: "address",
        action: "read",
      },
      {
        entity: "address",
        action: "write",
      },
      {
        entity: "onchain",
        action: "read",
      },
      {
        entity: "invoices",
        action: "read",
      },
      {
        entity: "invoices",
        action: "write",
      },
    ],
  },
  readonly: {
    permissions: [
      {
        entity: "info",
        action: "read",
      },
      {
        entity: "peers",
        action: "read",
      },
      {
        entity: "message",
        action: "read",
      },
      {
        entity: "address",
        action: "read",
      },
      {
        entity: "offchain",
        action: "read",
      },
      {
        entity: "onchain",
        action: "read",
      },
    ],
  },
  admin: {
    permissions: [],
  },
};

export async function bakeMacaroon({
  endpoint,
  macaroonType,
  macaroonHex,
}: {
  endpoint: string;
  macaroonType: MacaroonType;
  macaroonHex: string;
}) {
  return await fetch(`https://${endpoint}:8080/v1/macaroon`, {
    method: "POST",
    body: JSON.stringify(macaroonPermissions[macaroonType]),
    headers: {
      "Grpc-Metadata-Macaroon": macaroonHex,
    },
  });
}

export function ensureBase64 (macaroon: string) {
  let output = macaroon
  if (!isBase64(output)) {
    output = hexToBase64(macaroon)
  }
  return output
}

export async function backupMacaroon({
  macaroon,
  macaroonType,
  nodeId,
  password,
}: {
  macaroon: string;
  macaroonType: MacaroonType;
  nodeId: string;
  password: string;
}) {
  const macaroon64 = ensureBase64(macaroon)
  const encrypted = crypto.AES.encrypt(macaroon64, password).toString();
  const res = await voltageFetch("/node/macaroon", {
    method: "POST",
    body: JSON.stringify({
      node_id: nodeId,
      name: macaroonType,
      macaroon: encrypted,
    }),
  });
  return { encrypted, res };
}
