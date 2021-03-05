import {
  bakeMacaroon,
  backupMacaroon,
  MacaroonType,
  ensureBase64
} from "~/utils/bakeMacaroon";
import { ref } from "@vue/composition-api";
import { macaroonStore } from "~/store";
import { AES } from "crypto-js";

export default function useBackupMacaroon() {
  const loading = ref(false);
  const error = ref("");

  async function bakeBackupMacaroon({
    endpoint,
    macaroonType,
    macaroonHex,
    nodeId,
    password,
  }: {
    endpoint: string;
    macaroonType: MacaroonType;
    macaroonHex: string;
    nodeId: string;
    password: string;
  }) {
    loading.value = true;
    try {
      const res = await bakeMacaroon({ endpoint, macaroonType, macaroonHex });
      console.log({ res })
      let { macaroon } = (await res.json()) as { macaroon: string };
      console.log({ macaroon })
      macaroon = ensureBase64(macaroon)
      console.log({ macaroon })
      const { encrypted } = await backupMacaroon({
        macaroon,
        macaroonType,
        nodeId,
        password,
      });
      console.log({ encrypted })
      macaroonStore.MACAROON({
        nodeId,
        macaroon: encrypted,
        type: macaroonType,
      });

      // TEMP! delete me after
      const { macaroon: decrypted } = macaroonStore.macaroonState({
        nodeId,
        type: macaroonType
      })
      console.assert(decrypted === macaroon)
    } catch (e) {
      console.error(e);
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  return {
    bakeBackupMacaroon,
    loading,
    error,
  };
}
