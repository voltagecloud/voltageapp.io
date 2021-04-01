import { defineComponent, ref, computed } from "@vue/composition-api";
import { useRoute } from "@nuxtjs/composition-api";
import NodeCreationSetup from "~/components/NodeCreationSetup";
import NodeCreationFinalize from "~/components/NodeCreationFinalize";
import { createStore } from "~/store";

export default defineComponent({
  setup: () => {
    const route = useRoute();

    const creating = ref("");
    async function moveToPopulate() {
      creating.value = "Creating Node";
      if (!createStore.nodeId) {
        await createStore.dispatchCreate();
      }
      creating.value = "";

      if (createStore.createError) return;
      currentStep.value = 1;
    }

    const isCallbackSession = computed(() => {
      const q = route.value.query
      return !!q.session_id || !! q.paid_with
    })

    // if this is a callback session we should deserialize the store and send the /create request
    if (isCallbackSession.value) {
      createStore.DESERIALIZE()
      moveToPopulate()
    }

    const currentStep = ref(
      isCallbackSession.value ? 1 : 0
    );

    return () => (
      <div>
        {currentStep.value === 0 ? (
          <NodeCreationSetup
            callbackPath="/create/lnd"
            onNext={moveToPopulate}
            loading={!!creating.value}
          />
        ) : (
          <NodeCreationFinalize />
        )}
      </div>
    );
  },
});
