import { defineComponent } from "@vue/composition-api";
import { VContainer, VRow, VCol } from "vuetify/lib";
import PodcastLanding from "~/components/PodcastLanding";

export default defineComponent({
  setup: () => {
    return () => (
      <VContainer>
        <VRow justify="center" align="center" no-gutters="no-gutters">
          <VCol cols="12" md="10" lg="8">
            <PodcastLanding />
          </VCol>
        </VRow>
      </VContainer>
    );
  },
});
