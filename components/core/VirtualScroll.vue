<template>
  <div
    style="position: absolute; top: 0; bottom: 0; left: 0; right: 0"
    ref="outerContainer"
  >
    <div :style="containerStyle" ref="containerRef">
      <slot name="before" />
      <div :style="contentStyle">
        <div :style="visibleStyle">
          <slot :items="visibleChildren" />
        </div>
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
import useScrollAware from "~/compositions/useScrollAware";
import useHeightAware from "~/compositions/useHeightAware";

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
    // number of items to pad by
    renderAhead: {
      type: Number,
      required: false,
      default: 0,
    },
    // extra spaces to render for non-item content
    extra: {
      type: Number,
      required: false,
      default: 0
    }
  },
  setup: (props) => {
    const totalHeight = computed(() => props.height * (props.items.length + props.extra));

    const { containerRef: outerContainer, height } = useHeightAware();
    const { containerRef, scrollTop } = useScrollAware();

    const startNode = computed(() => {
      const start =
        Math.floor(scrollTop.value / props.height) - props.renderAhead;
      return Math.max(0, start);
    });

    const visibleNodesCount = computed(() => {
      const count =
        Math.ceil(height.value / props.height) + 2 * props.renderAhead;
      const output = Math.min(props.items.length - startNode.value, count);
      return output;
    });

    const offsetY = computed(() => (startNode.value) * props.height);

    const visibleChildren = computed(() =>
      new Array(visibleNodesCount.value)
        .fill(null)
        .map((_, index) => props.items[index + startNode.value])
    );

    // computed styles for elements
    const containerStyle = computed(() => ({
      height: `${height.value}px`,
      overflow: "auto",
    }));
    const contentStyle = computed(() => ({
      height: `${totalHeight.value}px`,
      overflow: "hidden",
      position: "relative",
      willChange: "transform",
    }));
    const visibleStyle = computed(() => ({
      transform: `translateY(${offsetY.value}px)`,
      willChange: "transform",
    }));

    return {
      visibleChildren,
      containerStyle,
      contentStyle,
      visibleStyle,
      containerRef,
      outerContainer,
    };
  },
});
</script>
