import crypto from "crypto-js";
import {
  defineComponent,
  createElement,
  PropType,
  computed,
} from "@vue/composition-api";
import type { Node } from "~/types/apiResponse";
import { macaroonStore } from "~/store";
import { MacaroonType } from "~/utils/bakeMacaroon";
import useBackupMacaroon from "~/compositions/useBackupMacaroon";

const h = createElement;

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
            <ul class="text-left">
              <li>
                Click the 'Get Started' button in Joule. Then select 'Remote
                Node'.
              </li>
              <li>
                Copy the Node URL below and paste it into the 'Node URL' field
                in Joule.
              </li>
              <li>
                Upload or paste both the Admin macaroon and a Readonly macaroon.
                Click 'Continue'.
              </li>
              <li>Create a password for Joule when prompted.</li>
            </ul>
          </div>
        ) : (
          <div>
            <div>Node URL</div>
            <copy-pill
              class="text-break"
              text={`https://${meta.value?.endpoint || ""}:8080`}
              color="accent"
              text-color="warning"
            />
            <p class="font-weight-light">click to copy</p>
            <p class="text--darken-1 v-card__title justify-center align-center">
              Admin Macaroon
            </p>
            <v-btn
              class="info--text"
              color="warning"
              text-color="highlight"
              href={`data:application/text-plain;base64,${adminMacaroon.value.macaroon}`}
              download="admin.macaroon"
              title="admin.macaroon"
            >
              Download Macaroon
            </v-btn>
            <div>Hex:</div>
            <copy-pill
              class="text-break"
              text={adminMacaroon.value.macaroonHex}
              color="accent"
              text-color="warning"
            />
            <p class="font-weight-light">click to copy</p>
            <p class="text--darken-1 v-card__title justify-center align-center">
              Readonly Macaroon
            </p>
            {!!readOnlyMacaroon.value.macaroon ? (
              <div>
                <v-btn
                  class="info--text"
                  color="warning"
                  href={`data:application/octet-stream;base64,${readOnlyMacaroon.value.macaroon}`}
                  download="readonly.macaroon"
                  title="readonly.macaroon"
                  loading={loading.value}
                >
                  Download Macaroon
                </v-btn>
                <p>Hex:</p>
                <copy-pill
                  class="text-break"
                  text={readOnlyMacaroon.value.macaroonHex}
                  color="accent"
                  text-color="warning"
                />
                <p class="font-weight-light">click to copy</p>
              </div>
            ) : (
              <v-btn
                class="info--text"
                color="warning"
                onClick={handleCreation}
                loading={loading.value}
              >
                Create Macaroon
              </v-btn>
            )}
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
