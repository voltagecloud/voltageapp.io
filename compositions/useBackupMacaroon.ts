import {
  bakeMacaroon,
  backupMacaroon,
  MacaroonType,
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
      const encrypted = AES.encrypt(macaroon, password).toString();
      macaroonStore.MACAROON({
        nodeId,
        macaroon: encrypted,
        type: macaroonType,
      });
      await backupMacaroon({
        macaroonText: encrypted,
        macaroonType,
        nodeId,
        password,
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
