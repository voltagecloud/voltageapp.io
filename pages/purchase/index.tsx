import { defineComponent, ref, computed, reactive } from "@vue/composition-api";
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
import useFetch from "~/compositions/useFetch";
import useStripeCheckout from "~/compositions/useStripeCheckout";
import {
  standardPlans,
  Product,
  Subscription,
  litePlans,
  Plan,
  btcPayOnlyPlans,
} from "~/utils/voltageProducts";
import useCart from "~/compositions/useCart";

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
  setup: (_, ctx) => {
    // add typed api calls
    const { loading, dispatch, data } = useFetch<{
      subscriptions: SubscriptionResponse[];
    }>("/billing");
    dispatch({ method: "GET" });

    const {
      cart,
      planQty,
      includeBtcPay,
      btcPayAddonMonthly,
      planState,
    } = useCart();

    const {
      stripeCheckout,
      loading: stripeLoading,
      error: stripeError,
    } = useStripeCheckout(cart);

    async function handleCheckout () {
      const isBtcPayOnly = planState.value.nodeType === Product.btcPay
      await stripeCheckout(isBtcPayOnly ? '/create/btcpay' : '/create/lnd')
    }

    const canPurchaseBTCPay = computed(() => {
      if (loading.value || !data.value) return false;
      const subsWithBTCPay = data.value.subscriptions.filter(
        (sub: SubscriptionResponse) => {
          return !!sub.items.find((item) => item.item === "btcpayserver");
        }
      );
      return subsWithBTCPay.length === 0;
    });

    function renderPlans(plans: Subscription<Plan, Product>[]) {
      return plans.map((plan) => {
        const active = planState.value.name === plan.name;
        const disabled =
          plan.nodeType === Product.btcPay && !canPurchaseBTCPay.value;
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

    // form states
    const state = reactive({
      loading: false,
      errorMessage: "",
      confirmModal: false,
    });

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
                {planState.value.nodeType !== Product.btcPay && (
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
                        onClick={handleCheckout}
                        loading={
                          loading.value || state.loading || stripeLoading.value
                        }
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
                  <div class="text--error">
                    {state.errorMessage || stripeError.value}
                  </div>
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
