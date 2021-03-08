<template>
  <div ref="container" :syle='containerStyle'>
    <div :style='contentStyle'>
      <div :style='visibleStyle'>
        <slot :items='visibleChildren' />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  ref,
  onMounted,
  onUnmounted,
} from "@vue/composition-api";

export default defineComponent({
  name: "VirtualScroll",
  props: {
    items: {
      type: Array as PropType<any[]>,
      required: true,
    },
    // number value in px
    height: {
      type: Number,
      required: true,
    },
    // number value in px
    padding: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  setup: (props) => {
    const totalHeight = computed(() => props.height * props.items.length);

    const container = ref<HTMLElement | null>(null);
    const viewportHeight = ref(0);

    function handleResize() {
      viewportHeight.value = container.value?.offsetHeight || 0;
    }

    onMounted(() => {
      window.addEventListener("resize", handleResize);
      handleResize();
    });

    onUnmounted(() => {
      window.removeEventListener("resize", handleResize);
    });

    const startNode = computed(() => {
      const start =
        Math.floor(container.value?.scrollTop || 0 / props.height) -
        props.padding;
      return Math.max(0, start);
    });

    const visibleNodesCount = computed(() => {
      const count =
        Math.ceil(viewportHeight.value / props.height) + 2 * props.padding;
      return Math.min(props.items.length - startNode.value, count);
    });

    const offsetY = computed(() => startNode.value * props.height);

    const visibleChildren = computed(() =>
      new Array(visibleNodesCount.value)
        .fill(null)
        .map((_, index) => props.items[index + startNode.value])
    );

    // computed styles for elements
    const containerStyle = computed(() => ({
      height: viewportHeight.value,
      overflow: "auto",
    }));
    const contentStyle = computed(() => ({
      height: totalHeight.value,
      overflow: "hidden",
    }));
    const visibleOffset = computed(() => ({
      transform: `translateY(${offsetY.value}px)`,
    }));

    return { visibleChildren, containerStyle, contentStyle, visibleOffset };
  },
});
</script>
