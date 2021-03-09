import { ref, onMounted, onUnmounted } from '@vue/composition-api'


export default function useScrollAware () {
  const scrollTop = ref(0)
  const containerRef = ref<null|HTMLElement>(null)
  const animationFrame = ref<number|null>(null)

  function onScroll (e: Event) {
    if (animationFrame.value) {
      cancelAnimationFrame(animationFrame.value)
    }
    animationFrame.value = requestAnimationFrame(() => {
      const target = e.target as HTMLDivElement
      scrollTop.value = target.scrollTop
    })
  }

  onMounted(() => {
    scrollTop.value = containerRef.value?.scrollTop || 0
    containerRef.value?.addEventListener('scroll', onScroll)
  })
  onUnmounted(() => containerRef.value?.removeEventListener('scroll', onScroll))

  return {
    scrollTop,
    containerRef
  }
}
