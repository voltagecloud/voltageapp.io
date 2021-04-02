import { ref, ComputedRef, isRef, watch } from "@vue/composition-api";
import { voltageFetch } from "~/utils/fetchClient";

export default function useFetch<T>(
  endpoint: string,
  initOpts?: RequestInit | ComputedRef<RequestInit>
) {
  const data = ref<T|null>(null);
  const error = ref<Error | null>(null);
  const statusCode = ref<number>(0);
  const loading = ref(false);


  async function dispatch(opts?: RequestInit) {
    const opt = opts || (isRef(initOpts) ? initOpts.value : initOpts);
    if (!opt) {
      error.value = Error("No request parameters supplied");
      return;
    }
    loading.value = true;
    const res = await voltageFetch(endpoint, opt);
    try {
      const json = await res.json();
      if (!res.ok) {
        error.value = json.message;
      } else {
        error.value = null
        data.value = json;
      }
    } catch (e) {
      error.value = e;
    } finally {
      statusCode.value = res.status;
      loading.value = false;
    }
  }

  // apply watcher for init opts
  if (isRef(initOpts)) {
    watch(initOpts, async (curOpts) => await dispatch(curOpts))
  }

  return {
    data,
    error,
    statusCode,
    loading,
    dispatch,
  };
}
