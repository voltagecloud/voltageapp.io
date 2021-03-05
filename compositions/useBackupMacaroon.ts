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
      let { macaroon } = (await res.json()) as { macaroon: string };
      macaroon = ensureBase64(macaroon)
      const { encrypted } = await backupMacaroon({
        macaroon,
        macaroonType,
        nodeId,
        password,
      });
      macaroonStore.MACAROON({
        nodeId,
        macaroon: encrypted,
        type: macaroonType,
      });
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
