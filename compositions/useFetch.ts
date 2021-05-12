import { ref, ComputedRef, isRef, watch } from "@vue/composition-api";
import { voltageFetch } from "~/utils/fetchClient";

interface ComputedOpts extends RequestInit {
  pause: boolean|ComputedRef<boolean>
}

export default function useFetch<T>(
  endpoint: string,
  initOpts?: RequestInit | ComputedRef<ComputedOpts>
) {
  const data = ref<T|null>(null);
  const error = ref<Error | null>(null);
  const statusCode = ref<number>(0);
  const loading = ref(false);


  async function dispatch(opts?: RequestInit) {
    if (isRef(initOpts) && initOpts.value?.pause) {
      const pause = initOpts.value.pause
      if (isRef(pause) && pause.value) return
      if (pause) return
    }
    const opt = opts || (isRef(initOpts) ? initOpts.value : initOpts)
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

  // if the composition is invoked with the options then dispatch immediately
  if (initOpts) {
    dispatch()
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
