import { defineComponent, computed } from "@vue/composition-api";
import JsonTable, { JsonData } from "~/components/core/JsonTable";
import { useRoute } from "@nuxtjs/composition-api";
import { nodeStore } from "~/store";
import { VContainer } from "vuetify/lib";
import NodeControls from "~/components/viewnode/NodeControls.vue";
import type { BitcoindNode } from "~/types/apiResponse";

export default defineComponent({
  setup: () => {
    const route = useRoute();

    const data = computed(
      () => nodeStore.nodeData(route.value.params.id) as BitcoindNode
    );

    const payload = computed(() => ({
      Status: data.value?.status,
      "Bitcoind Version": data.value.bitcoind_version,
      "Voltage Version": data.value.volt_version,
      "Creation Date": data.value.created,
      "Expiry Date": data.value.expires,
      "Api Endpoint": data.value.api_endpoint,
      Username: data.value.username,
      Password: data.value.password,
    }));

    return () => (
      <VContainer>
        <NodeControls
          nodeID={route.value.params.id}
          {...{
            scopedSlots: {
              "append-content": () => (
                <JsonTable data={() => (payload.value as unknown) as JsonData} />
              ),
            },
          }}
        ></NodeControls>
      </VContainer>
    );
  },
});
