import {
  bakeMacaroon,
  backupMacaroon,
  MacaroonType,
} from "~/utils/bakeMacaroon";
import { ref } from "@vue/composition-api";
import { macaroonStore } from "~/store";

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
      const { macaroon } = (await res.json()) as { macaroon: string };
      macaroonStore.MACAROON({ nodeId, macaroon, type: macaroonType });
      await backupMacaroon({
        macaroonText: macaroon,
        macaroonType,
        nodeId,
        password,
      });
    } catch (e) {
      console.error(e);
      error.value = e;
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
