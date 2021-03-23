import { defineComponent, ref } from "@vue/composition-api";
import { useRoute } from "@nuxtjs/composition-api";
import NodeCreationSetup from "~/components/NodeCreationSetup";
import NodeCreationFinalize from "~/components/NodeCreationFinalize";

export default defineComponent({
  setup: () => {
    const route = useRoute();

    const currentStep = ref(route.value.query.session_id ? 1 : 0);

    return () => (
      <div>
        {currentStep.value === 0 ? (
          <NodeCreationSetup
            callbackPath="/create/lnd"
            onNext={() => (currentStep.value = 1)}
          />
        ) : (
          <NodeCreationFinalize />
        )}
      </div>
    );
  },
});
