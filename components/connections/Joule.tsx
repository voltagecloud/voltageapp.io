import { defineComponent, PropType, computed } from "@vue/composition-api";
import type { Node } from "~/types/apiResponse";
import { macaroonStore } from "~/store";
import { MacaroonType } from "~/utils/bakeMacaroon";
import useBackupMacaroon from "~/compositions/useBackupMacaroon";
import NamedCopyPill from "~/components/core/NamedCopyPill.tsx";
import Base64Download from "~/components/core/Base64Download.tsx";

export default defineComponent({
  components: {
    VContainer: () => import("vuetify/lib").then((m) => m.VContainer),
    CopyPill: () => import("~/components/core/CopyPill.vue"),
    VBtn: () => import("vuetify/lib").then((m) => m.VBtn),
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true,
    },
  },
  setup: (props) => {
    const adminMacaroon = computed(() =>
      macaroonStore.macaroonState({
        nodeId: props.node.node_id,
        type: MacaroonType.admin,
      })
    );

    const readOnlyMacaroon = computed(() =>
      macaroonStore.macaroonState({
        nodeId: props.node.node_id,
        type: MacaroonType.readonly,
      })
    );

    const meta = computed(() =>
      macaroonStore.findNodeMeta({ nodeId: props.node.node_id })
    );

    // attempt to load the macaroon if it exists
    async function getMac() {
      if (readOnlyMacaroon.value.macaroon) return;
      await macaroonStore.FETCH_MACAROON({
        nodeId: props.node.node_id,
        macaroonType: MacaroonType.readonly,
        password: adminMacaroon.value.password,
      });
    }
    getMac();

    const { loading, error, bakeBackupMacaroon } = useBackupMacaroon();

    async function handleCreation() {
      return await bakeBackupMacaroon({
        endpoint: meta.value?.endpoint as string,
        macaroonType: MacaroonType.readonly,
        password: adminMacaroon.value.password,
        nodeId: props.node.node_id,
        macaroonHex: adminMacaroon.value.macaroonHex,
      });
    }

    return () => (
      <v-container class="text-center">
        <p class="font-weight-light text--darken-1 v-card__title justify-center align-center">
          <a href="https://lightningjoule.com" target="_blank">
            Joule
          </a>
        </p>
        {!props.node.settings.rest ? (
          <div>
            <div
              class="font-weight-light text--darken-1 justify-center align-center"
              max-width="800"
              style="color: #ff0000; padding: 20px;"
            >
              Joule uses the REST API to communicate with your node. You have
              this API disabled in your node settings. Please enable it to
              connect with Joule.
            </div>
          </div>
        ) : (
            <div>
              <p>
                Click the 'Get Started' button in Joule. Then select 'Remote
                Node'.
              </p>
              <p>
                Copy the Node URL below and paste it into the 'Node URL' field
                in Joule.
              </p>
              <NamedCopyPill title="Node URL" value={`https://${meta.value?.endpoint || ""}:8080`} />
              <p>
                Upload or paste both the Admin macaroon and a Readonly macaroon.
                Click 'Continue'.
              </p>


              <Base64Download title="Admin Macaroon" buttonText="Download Macaroon" filename="admin.macaroon" base64={adminMacaroon.value.macaroon} />
              <NamedCopyPill title="Hex" value={adminMacaroon.value.macaroonHex} />

              {!!readOnlyMacaroon.value.macaroon ? (
                <div>
                  <Base64Download title="Readonly Macaroon" buttonText="Download Macaroon" filename="readonly.macaroon" base64={readOnlyMacaroon.value.macaroon} loading={loading.value} />
                  <NamedCopyPill title="Hex" value={readOnlyMacaroon.value.macaroonHex} />
                </div>
              ) : (
                  <div style="margin-bottom: 16px;">
                    <div style="margin-bottom: 8px;">Readonly Macaroon</div>
                    <v-btn
                      class="info--text"
                      color="warning"
                      onClick={handleCreation}
                      loading={loading.value}
                    >
                      Create Macaroon
                    </v-btn>
                  </div>
                )}
              <p>Create a password for Joule when prompted.</p>
              <div>{error.value}</div>
            </div>
          )}
        <a href="https://lightningjoule.com/faq" target="_blank">
          Joule Documentation.
        </a>
      </v-container>
    );
  },
});
