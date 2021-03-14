import { defineComponent, ref, computed } from "@vue/composition-api";
import {
  VContainer,
  VCol,
  VCard,
  VBtn,
  VRadioGroup,
  VRadio,
  VSelect,
  VSwitch,
  VDialog
} from "vuetify/lib";
import useNodePricing from "~/compositions/useNodePricing";
import { Plan, Subscription, Product } from "~/utils/voltageProducts";
import { Network } from "~/types/api";
import { createStore } from "~/store";
import PrepayPurchaseCard from '~/components/PrepayPurchaseCard'

export default defineComponent({
  props: {
    btcPayServerToggle: {
      type: Boolean,
      required: false,
      default: false,
    },
    callbackPath: {
      type: String,
      required: true
    }
  },
  setup: (props, { emit }) => {
    const lightningSoftwares = [
      {
        img: require("~/assets/lnd-logo.png"),
        disabled: false,
        alt: "Lnd Logo",
      },
      {
        img: require("~/assets/c-lightning-logo.png"),
        disabled: true,
        alt: "C-Lightning Logo",
      },
      {
        img: require("~/assets/eclair-logo.png"),
        disabled: true,
        alt: "Eclair Logo",
      },
    ];

    const planState = computed({
      get: () => createStore.planState,
      set: (v: Subscription<Plan, Product>) => createStore.PLAN_STATE(v),
    });

    const includeBtcPay = computed({
      get: () => createStore.includeBtcPay,
      set: (v: boolean) => createStore.INCLUDE_BTCPAY(v),
    });

    const selectedNetwork = computed({
      get: () => createStore.network,
      set: (v: Network) => createStore.NETWORK(v),
    });

    const billingOptions = Object.keys(Plan);

    function pricingText(monthlyPrice?: number) {
      if (typeof monthlyPrice !== "undefined") {
        return `$${monthlyPrice}/mo`;
      }
      return "Not Available";
    }

    const { litePlan, standardPlan, billingCycle } = useNodePricing();

    function handleSelectProduct(subscription?: Subscription<Plan, Product>) {
      if (subscription) {
        planState.value = Object.assign({}, subscription);
      }
    }

    const networks = Object.keys(Network);
    const disableMainnet = ref(false);

    function handleBillingChange(billing: Plan) {
      selectedNetwork.value = Network.testnet;
      disableMainnet.value = billing === Plan.trial;
      billingCycle.value = billing;
    }

    // create logic
    const createDisabled = computed(() => {
      if (!planState.value) return true;
      if (!selectedNetwork.value) return true;
      return false;
    });

    const showPrepayModal = ref(false);

    async function handleCreation() {
      if (
        planState.value.plan === Plan.monthly ||
        planState.value.plan === Plan.yearly
      ) {
        // customer is prepaying, show payment methods
        showPrepayModal.value = true;
      } else if (planState.value.plan === Plan.payAsYouGo) {
        // handle some pay as you go state
        // TODO implement pay as you go
      } else if (planState.value.plan === Plan.trial) {
        // trial does not require store serialization since there is no redirect
        emit("next");
      }
    }

    return () => (
      <VContainer>
        <div class="d-flex flex-row justify-center">
          <VCol cols="12" md="10" lg="8">
            <VCard color="info">
              <div class="d-flex flex-row justify-space-around flex-wrap">
                {lightningSoftwares.map((software) => (
                  <VBtn
                    tile
                    raised
                    disabled={software.disabled}
                    elevation={12}
                    class="ma-3"
                    style={{
                      borderRadius: software.disabled ? "" : "5px",
                      border: software.disabled ? "" : "solid",
                      borderColor: software.disabled ? "" : "#1d437b",
                      background: "#ffffff",
                      width: "200px",
                      height: "150px",
                    }}
                  >
                    <div class="d-flex flex-column">
                      <img src={software.img} alt={software.alt} width="150" />
                      {software.disabled && "Not yet available"}
                    </div>
                  </VBtn>
                ))}
              </div>
              <div class="text-h5 pa-3">Billing Option</div>
              <div class="mx-12">
                <VSelect
                  items={billingOptions}
                  value={billingCycle.value}
                  onChange={(v: Plan) => handleBillingChange(v)}
                  color="highlight"
                  background-color="secondary"
                  outlined
                />
              </div>
              <div class="text-h5 pa-3">Node Type</div>
              <div class="d-flex flex-row flex-wrap justify-space-around">
                <VCol cols="8" md="5" lg="4">
                  <button
                    disabled={!litePlan.value}
                    onClick={() => handleSelectProduct(litePlan.value)}
                    class="d-block"
                    style="width: 100%"
                  >
                    <VCard color="secondary" class="py-3">
                      <div class="d-flex flex-column">
                        <div class="text-h4">Lite</div>
                        <div>Backed by Neutrino</div>
                        <div>{pricingText(litePlan.value?.cost)}</div>
                      </div>
                    </VCard>
                  </button>
                </VCol>
                <VCol cols="8" md="5" lg="4">
                  <button
                    disabled={!standardPlan.value}
                    onClick={() => handleSelectProduct(standardPlan.value)}
                    class="d-block"
                    style="width: 100%"
                  >
                    <VCard color="secondary" class="py-3">
                      <div class="d-flex flex-column">
                        <div class="text-h4">Standard</div>
                        <div>Backed by Bitcoin Core</div>
                        <div>{pricingText(standardPlan.value?.cost)}</div>
                      </div>
                    </VCard>
                  </button>
                </VCol>
              </div>
              <div class="pa-3 text-h5">Network</div>
              <div class="d-flex flex-column justify-start ml-12">
                <VRadioGroup
                  value={selectedNetwork.value}
                  onChange={(v: Network) => (selectedNetwork.value = v)}
                  aria-label="Network"
                >
                  {networks.map((net) => (
                    <VRadio
                      key={net}
                      label={net}
                      value={net}
                      disabled={net === Network.mainnet && disableMainnet.value}
                      color="highlight"
                    />
                  ))}
                </VRadioGroup>
              </div>
              {props.btcPayServerToggle && planState.value.plan !== Plan.trial && (
                <div>
                  <div class="pa-3 text-h5">Include BtcPay Server</div>
                  <div class="d-flex flex-column justify-start ml-12">
                    <VSwitch
                      value={includeBtcPay.value}
                      onChange={(v: boolean) => (includeBtcPay.value = v)}
                      inset
                      color="highlight"
                    />
                  </div>
                </div>
              )}
              <div class="pa-3 text-h5">Region</div>
              <div class="mx-12">
                <VSelect
                  items={["us-west"]}
                  value={"us-west"}
                  aria-label="Region"
                  outlined
                  color="highlight"
                  background-color="secondary"
                />
              </div>
              <div class="pa-3">
                <VBtn
                  block
                  onClick={handleCreation}
                  disabled={createDisabled.value}
                >
                  Create Node
                </VBtn>
              </div>
            </VCard>
          </VCol>
        </div>
        <VDialog value={showPrepayModal.value}>
          <PrepayPurchaseCard callbackPath={props.callbackPath} />
        </VDialog>
      </VContainer>
    );
  },
});
