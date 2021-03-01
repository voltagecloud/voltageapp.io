import {
  defineComponent,
  createElement,
  ref,
  computed,
  reactive,
} from "@vue/composition-api";
import {
  VContainer,
  VRow,
  VCol,
  VCard,
  VCardTitle,
  VBtn,
  VSlider,
  VDivider,
  VCheckbox,
  VDialog,
  VTooltip,
} from "vuetify/lib";
import { loadStripe } from "@stripe/stripe-js";
import { voltageFetch } from "~/utils/fetchClient";
import useFetch from "~/compositions/useFetch";

const h = createElement;

enum Plan {
  yearly = "yearly",
  monthly = "monthly",
}

enum NodeType {
  lite = "lite",
  standard = "standard",
  btcPay = "btcpayserver",
}

interface Subscription {
  desc: string;
  name: string;
  cost: number;
  plan: Plan;
  nodeType: NodeType;
  // is this subscription type just btcpay server
}
const litePlans: Subscription[] = [
  {
    desc:
      "One year of hosting for a Lightning node backend by Neutrino. Ideal for personal wallets or testing purposes.",
    name: "Lite Node/1Yr",
    cost: 9.99,
    plan: Plan.yearly,
    nodeType: NodeType.lite,
  },
  {
    desc:
      "One month of hosting for a Lightning node backend by Neutrino. Ideal for personal wallets or testing purposes.",
    name: "Lite Node/1Mo",
    cost: 12.99,
    plan: Plan.monthly,
    nodeType: NodeType.lite,
  },
];
const standardPlans: Subscription[] = [
  {
    desc:
      "One year of hosting for a Lightning node backend by a Bitcoin full node. Recommended option for anything outside of a personal wallet.",
    name: "Standard Node/1Yr",
    cost: 26.99,
    plan: Plan.yearly,
    nodeType: NodeType.standard,
  },
  {
    desc:
      "One month of hosting for a Lightning node backend by a Bitcoin full node. Recommended option for anything outside of a personal wallet.",
    name: "Standard Node/1Mo",
    cost: 31.99,
    plan: Plan.monthly,
    nodeType: NodeType.standard,
  },
];
const btcPayOnlyPlans: Subscription[] = [
  {
    desc:
      "One BTCPay Server account for one year. This option doesn't include any Lightning nodes. However, you can add Lightning nodes later.",
    name: "BTCPay Server/1Yr",
    cost: 6.99,
    plan: Plan.yearly,
    nodeType: NodeType.btcPay,
  },
  {
    desc:
      "One BTCPay Server account for one month. This option doesn't include any Lightning nodes. However, you can add Lightning nodes later.",
    name: "BTCPay Server/1Mo",
    cost: 8.99,
    plan: Plan.monthly,
    nodeType: NodeType.btcPay,
  },
];

interface SubscriptionItem {
  item: string;
  quantity: number;
}
interface SubscriptionResponse {
  items: SubscriptionItem[];
}

export default defineComponent({
  components: {
    VContainer,
    VRow,
    VCol,
    VCard,
    VSlider,
    VDivider,
    VCheckbox,
    VCardTitle,
    VDialog,
    VTooltip,
  },
  middleware: ["loadCognito", "assertAuthed", "loadUser"],
  setup: (_, ctx) => {
    // add typed api calls
    const { loading, dispatch, data } = useFetch<{
      subscriptions: SubscriptionResponse[];
    }>("/billing");
    dispatch({ method: "GET" });

    const canPurchaseBTCPay = computed(() => {
      if (loading.value || !data.value) return false;
      const subsWithBTCPay = data.value.subscriptions.filter(
        (sub: SubscriptionResponse) => {
          return sub.items.find((item) => item.item === "btcpayserver");
        }
      );
      return subsWithBTCPay.length === 0;
    });

    const planState = ref<Subscription>(Object.assign(standardPlans[0]));

    function renderPlans(plans: Subscription[]) {
      return plans.map((plan) => {
        const active = planState.value.name === plan.name;
        const disabled =
          plan.nodeType === NodeType.btcPay && !canPurchaseBTCPay.value;
        return (
          <v-col cols="12">
            <v-tooltip
              top
              disabled={!disabled}
              scopedSlots={{
                activator: ({ on }: { on: any }) => (
                  <div {...{ on }}>
                    <VBtn
                      raised
                      block
                      large
                      onClick={() => {
                        planState.value = Object.assign(plan);
                      }}
                      style={
                        active
                          ? {
                              border: "solid",
                              borderColor: "#1d437b",
                              background: "#ffffff",
                            }
                          : { background: "#e4e4e4" }
                      }
                      disabled={disabled}
                    >
                      <div class="d-flex flex-grow-1">{plan.name}</div>
                      <div class="my-3">${plan.cost}</div>
                    </VBtn>
                  </div>
                ),
              }}
            >
              You can only create or purchase 1 BTCPay Server
            </v-tooltip>
          </v-col>
        );
      });
    }

    const planQty = ref(1);
    const includeBtcPay = ref(false);
    const btcPayAddonMonthly = computed(() =>
      planState.value.plan === Plan.monthly ? 8.99 : 6.99
    );

    const cart = computed(() => {
      const isBtcPay = planState.value.nodeType === NodeType.btcPay;
      const timeMultiplier = planState.value.plan === Plan.monthly ? 1 : 12;
      const addonPrice =
        includeBtcPay.value && !isBtcPay
          ? timeMultiplier * btcPayAddonMonthly.value
          : 0;
      const multiplier =
        planState.value.nodeType === NodeType.btcPay ? 1 : planQty.value;
      const totalPrice = (
        timeMultiplier * multiplier * planState.value.cost +
        addonPrice
      ).toFixed(2);
      const items: { plan: string; quantity: number; type: string }[] = [
        {
          plan: isBtcPay
            ? planState.value.plan
            : `node_${planState.value.plan}`,
          quantity: isBtcPay ? 1 : planQty.value,
          type: planState.value.nodeType,
        },
      ];
      if (addonPrice) {
        const btcPayPlanName = planState.value.plan.replace("node_", "");
        items.push({
          plan: btcPayPlanName,
          quantity: 1,
          type: NodeType.btcPay,
        });
      }
      return {
        totalPrice,
        items,
      };
    });

    // form states
    const state = reactive({
      loading: false,
      errorMessage: "",
      confirmModal: false,
    });

    const stripePromise = loadStripe(process.env.stripeKey as string);
    async function cardCheckout() {
      state.loading = true;
      try {
        const res = await voltageFetch("/stripe/session", {
          method: "POST",
          body: JSON.stringify({
            items: cart.value.items,
          }),
        });
        const { session_id } = await res.json();
        const stripe = await stripePromise;

        if (!stripe) {
          state.errorMessage = "There was a problem contacting stripe servers";
          return;
        }

        const { error } = await stripe.redirectToCheckout({
          sessionId: session_id,
        });
        state.errorMessage = error.message || "";
      } catch (e) {
        console.log(e);
        state.errorMessage = "There was a problem processing request";
      } finally {
        state.loading = false;
      }
    }

    async function confirmBitcoin() {
      if (planState.value.plan === Plan.monthly) {
        state.confirmModal = true;
      } else {
        await bitcoinCheckout();
      }
    }

    async function bitcoinCheckout() {
      state.confirmModal = false;
      state.loading = true;
      try {
        const res = await ctx.root.$axios.post("/btcpay/session", {
          items: cart.value.items,
        });
        window.location = res.data.redirect_url;
      } catch (e) {
        console.log(e);
        state.errorMessage = "There was a problem processing request";
      } finally {
        state.loading = false;
      }
    }

    return () => (
      <v-container>
        <v-row align="start" justify="center">
          <v-col cols="12" class="my-1">
            <v-card class="text-center text-h5 pa-3">
              Purchase Lighting Nodes
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="7" xl="8">
            <v-card>
              <v-container>
                <v-card-title>Choose a Plan</v-card-title>
                <v-row>
                  {renderPlans(litePlans)}
                  <v-col cols="12">
                    <v-divider />
                  </v-col>
                  {renderPlans(standardPlans)}
                  <v-col cols="12">
                    <v-divider />
                  </v-col>
                  {renderPlans(btcPayOnlyPlans)}
                </v-row>
              </v-container>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="5" xl="4">
            <v-card>
              <v-container>
                <v-card-title class="text-center">Order Details</v-card-title>
                <div class="d-flex justify-space-between my-3">
                  <div>{planState.value.name}</div>
                  <div>${planState.value.cost}/mo</div>
                </div>
                <div class="d-flex flex-column justify-space-between my-3">
                  <div class="text-h6">Description</div>
                  <div class="text-caption">{planState.value.desc}</div>
                </div>
                {planState.value.nodeType !== NodeType.btcPay && (
                  <div>
                    <div class="my-3">
                      <div>Node Quantity:</div>
                      <v-slider
                        class="mt-10"
                        onChange={(val: number) => {
                          planQty.value = val;
                        }}
                        value={planQty.value}
                        thumb-label="always"
                        track-color="highlight"
                        color="primary"
                        max="25"
                        min="1"
                      />
                    </div>
                    <v-divider />
                    {!canPurchaseBTCPay.value || (
                      <div class="d-flex pa-2 justify-space-between">
                        <div class="text-h6 d-flex flex-column">
                          <div>Add BTCPay Server</div>
                          <div>${btcPayAddonMonthly.value}/mo</div>
                        </div>
                        <div class="d-flex flex-column align-center">
                          <div>Include</div>
                          <v-checkbox
                            class="mt-0"
                            onChange={(val: boolean) => {
                              includeBtcPay.value = val;
                            }}
                            value={includeBtcPay.value}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div class="d-flex justify-space-between">
                  <div>Total:</div>
                  <div class="font-weight-bold">${cart.value.totalPrice}</div>
                </div>
                <v-divider />
                <v-container>
                  <v-row>
                    <v-col cols="12" xl="6">
                      <VBtn
                        onClick={cardCheckout}
                        loading={loading.value || state.loading}
                        block
                        color="highlight"
                        class="info--text"
                      >
                        Purchase with Card
                      </VBtn>
                    </v-col>
                    <v-col cols="12" xl="6">
                      <VBtn
                        onClick={confirmBitcoin}
                        loading={loading.value || state.loading}
                        block
                        color="highlight"
                        class="info--text"
                      >
                        Purchase with Bitcoin
                      </VBtn>
                    </v-col>
                  </v-row>
                </v-container>
              </v-container>
            </v-card>
          </v-col>
        </v-row>
        {/* confim bitcoin dialog */}
        <v-dialog
          value={state.confirmModal}
          onInput={(val: boolean) => (state.confirmModal = val)}
          max-width="60%"
        >
          <v-card class="pa-5">
            <v-card-text class="pt-3 warning--text text--darken-1 text-h6">
              When purchasing a monthly subscription with Bitcoin you'll be
              required to manually pay a new invoice every month. For that
              reason we recommend a yearly subscription.
            </v-card-text>
            <v-card-actions>
              <VBtn color="info" onClick={bitcoinCheckout}>
                Continue with monthly
              </VBtn>
              <VBtn
                onClick={() => {
                  state.confirmModal = false;
                }}
              >
                {" "}
                Go Back
              </VBtn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    );
  },
});
