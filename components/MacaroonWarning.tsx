import { defineComponent } from "@vue/composition-api";
import { VContainer, VBtn } from "vuetify/lib";

export default defineComponent({
  components: {
    VContainer,
    VBtn
  },
  setup: () => {
    return () => ( 
        <v-container class="text-center">
        <p class="font-weight-light text--darken-1">
            This node does not have an admin macaroon backed up. Please back up an admin macaroon to use this feature.
        </p>
        <p class="font-weight-light text--darken-1">
            Check out our&nbsp;<a href="https://docs.voltage.cloud/api/creating-a-node-example#process" target="_blank">
            node creation documentation
            </a>&nbsp;for more help creating a node via the API.
        </p>
        <v-btn onClick={() => location.reload()}>
            Refresh 
        </v-btn>
        </v-container>
    );
  },
});
