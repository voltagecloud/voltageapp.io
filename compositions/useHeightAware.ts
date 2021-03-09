import { ref, onMounted, onUnmounted } from '@vue/composition-api'

export default function useHeightAware () {
    //determine outer height
    const containerRef = ref<HTMLDivElement|null>(null)
    const height = ref(0)

    function onResize () {
      const elem = containerRef.value
      height.value = elem?.offsetHeight || 0;
    }

    onMounted(() => {
      onResize()
      window.addEventListener("resize", onResize);
    })
    onUnmounted(() => window.removeEventListener("resize", onResize))

    return {
      containerRef,
      height
    }
}
