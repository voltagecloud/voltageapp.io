import { defineComponent, computed } from "@vue/composition-api";
import JsonTable, { JsonData } from "~/components/core/JsonTable";
import { useRoute } from "@nuxtjs/composition-api";
import { nodeStore } from "~/store";
import { VContainer } from "vuetify/lib";
import NodeControls from "~/components/viewnode/NodeControls.vue";
import type { BitcoindNode } from "~/types/apiResponse";
import CopyPill from "~/components/core/CopyPill.vue";

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
    }));

    return () => (
      <VContainer>
        <NodeControls
          nodeID={route.value.params.id}
          {...{
            scopedSlots: {
              "append-content": () => (
                <JsonTable data={() => (payload.value as unknown) as JsonData}>
                  <tr>
                    <td>
                      <div style="word-break: normal;">Password</div>
                    </td>
                    <td class="text-end">
                      <CopyPill 
                        color="accent"
                        text-color="warning"
                        class="mr-3"
                        text={data.value.password}
                        hide 
                      />
                    </td>
                  </tr>
                </JsonTable>
              ),
            },
          }}
        ></NodeControls>
      </VContainer>
    );
  },
});
