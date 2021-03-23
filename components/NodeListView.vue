<template>
  <VirtualScroll :items="nodes" :height="120" :renderAhead="1" :extra="1">
    <template v-slot:default="{ items }">
      <div
        class="d-flex flex-row justify-space-between"
        style="height: 120px; background-color: white"
      >
        <v-col cols="12" md="10" lg="8" class="mx-auto">
          <div class="d-flex flex-row align-center justify-space-between" style="height: 100%;">
            <div class="text-h5">{{ numRunning }} Nodes Running</div>
            <v-btn dark color="highlight" @click="$router.push('/create/lnd')"
              >Launch New</v-btn
            >
          </div>
        </v-col>
        <v-col cols="12" md="10" lg="8" class="mx-auto">
          <!--v-autocomplete -->
        </v-col>
      </div>
      <div v-for="(node, i) in items" :key="`${node.node_id}_${i}`">
        <v-col cols="12" md="10" lg="8" class="mx-auto">
          <node-controls :nodeID="node.node_id" />
        </v-col>
      </div>
    </template>
  </VirtualScroll>
</template>
<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";
import { nodeStore } from "~/store";

export default defineComponent({
  components: {
    VirtualScroll: () => import("~/components/core/VirtualScroll.vue"),
    NodeControls: () => import("~/components/viewnode/NodeControls.vue"),
  },
  setup: () => {
    return {
      nodes: computed(() => nodeStore.IDNames),
      numRunning: computed(
        () => nodeStore.nodes.filter((node) => node.status === "running").length
      ),
    };
  },
});
</script>
