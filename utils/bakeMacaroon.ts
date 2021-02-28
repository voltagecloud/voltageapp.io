import { voltageFetch } from "~/utils/fetchClient";
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

export async function backupMacaroon({
  macaroonText,
  macaroonType,
  nodeId,
  password,
}: {
  macaroonText: string;
  macaroonType: MacaroonType;
  nodeId: string;
  password: string;
}) {
  const encrypted = crypto.AES.encrypt(macaroonText, password).toString();
  return await voltageFetch("/node/macaroon", {
    method: "POST",
    body: JSON.stringify({
      node_id: nodeId,
      name: macaroonType,
      macaroon: encrypted,
    }),
  });
}
