import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators";
import { Address4, Address6 } from "ip-address";
import { Network, Settings } from "~/types/api";
import {
  standardPlans,
  Subscription,
  Plan,
  Product,
} from "~/utils/voltageProducts";
import { voltageFetch } from "~/utils/fetchClient";

export interface Cart {
  items: {
    plan: string;
    quantity: number;
    type: string;
  }[];
}

type resError = Error | null;

const defaultSettings = {
  autopilot: false,
  grpc: true,
  rest: true,
  tor: false,
  keysend: true,
  wumbo: true,
  webhook: "",
  alias: "",
  color: "#EF820D",
  whitelist: [],
  minchansize: "",
  maxchansize: "",
  autocompaction: false,
  defaultfeerate: "",
  sphinx: false,
};

@Module({
  name: "create",
  stateFactory: true,
  namespaced: true,
})
export default class CreateModule extends VuexModule {
  // what the voltage name of the node should be
  nodeName: string = "";
  // what bitcoin network to create the node on
  network: Network = Network.mainnet;
  // is this a trial node
  trial = false;
  // setttings this node should be creatd with
  settings: Settings = Object.assign({}, defaultSettings);

  password: string = "";

  // Id of the node which is returned at the /create call
  nodeId = "";

  // referral code from podcasts
  referralCode = "";

  // store cart data
  // what is the type of subscription being purchased
  planState: Subscription<Plan, Product> = Object.assign({}, standardPlans[0]);
  // how many are being purchased
  planQty: number = 1;
  // should the subscription bundle with btc pay
  includeBtcPay: boolean = false;

  @Mutation
  NODE_NAME(name: string) {
    this.nodeName = name;
  }

  @Mutation
  SETTINGS(settings: Settings) {
    this.settings = Object.assign({}, this.settings, settings);
  }

  @Mutation
  NODE_ID(nodeID: string) {
    this.nodeId = nodeID;
  }

  @Mutation
  AUTOFILL_WHITELIST(ip: string) {
    this.settings.whitelist = [(ip as unknown) as Address4 | Address6];
  }

  @Mutation
  HYDRATE_SETTINGS(settings: Settings) {
    this.settings = Object.assign(this.settings, settings);
  }

  @Mutation
  REFERRAL(code: string) {
    this.referralCode = code;
  }

  @Mutation
  NETWORK(network: Network) {
    this.network = network;
  }

  @Mutation
  PLAN_STATE(state: Subscription<Plan, Product>) {
    this.planState = state;
  }

  @Mutation
  PLAN_QTY(qty: number) {
    this.planQty = qty;
  }

  @Mutation
  INCLUDE_BTCPAY(include: boolean) {
    this.includeBtcPay = include;
  }

  @Mutation
  PASSWORD(v: string) {
    this.password = v;
  }

  get btcPayAddonMonthly() {
    return this.planState.plan === Plan.monthly ? 8.99 : 6.99;
  }

  get cart() {
    const isBtcPay = this.planState.nodeType === Product.btcPay;
    const timeMultiplier = this.planState.plan === Plan.monthly ? 1 : 12;

    const addonPrice =
      this.includeBtcPay && !isBtcPay
        ? timeMultiplier * this.btcPayAddonMonthly
        : 0;

    const multiplier =
      this.planState.nodeType === Product.btcPay ? 1 : this.planQty;

    const totalPrice = (
      timeMultiplier * multiplier * this.planState.cost +
      addonPrice
    ).toFixed(2);

    const items: { plan: string; quantity: number; type: string }[] = [
      {
        // what is the billing frequency
        plan: isBtcPay ? this.planState.plan : `node_${this.planState.plan}`,
        // what is the quantity of items
        quantity: isBtcPay ? 1 : this.planQty,
        // what is the product name
        type: this.planState.nodeType,
      },
    ];

    if (addonPrice) {
      const btcPayPlanName = this.planState.plan.replace("node_", "");
      items.push({
        plan: btcPayPlanName,
        quantity: 1,
        type: Product.btcPay,
      });
    }
    return {
      totalPrice,
      items,
    };
  }

  @Mutation
  SERIALIZE() {
    const data = {
      nodeName: this.nodeName,
      network: this.network,
      trial: this.trial,
      settings: this.settings,
      nodeId: this.nodeId,
      referralCode: this.referralCode,
      planState: this.planState,
      planQty: this.planQty,
      includeBtcPay: this.includeBtcPay,
    };
    window.localStorage.setItem("createStore", JSON.stringify(data));
  }

  // should be called to mark the node creation as complete and reset the store
  @Mutation
  COMPLETE() {
    // do some cleanup and reset action
    this.nodeName = "";
    this.trial = false;
    this.planState = Object.assign({}, standardPlans[0]);
    this.planQty = 1;
    this.includeBtcPay = false;
    this.nodeId = "";
    this.referralCode = "";
    window.localStorage.removeItem("createStore");
  }

  @Mutation
  DESERIALIZE() {
    const cartData = window.localStorage.getItem("createStore");
    if (!cartData) return;
    const js = JSON.parse(cartData);
    this.nodeName = js.nodeName;
    this.network = js.network;
    this.trial = js.trial;
    this.settings = js.settings;
    this.nodeId = js.nodeId;
    this.referralCode = js.referralCode;
    this.planState = js.planState;
    this.planQty = js.planQty;
    this.includeBtcPay = js.includeBtcPay;
  }

  populateError: resError = null;

  @Mutation
  POPULATE_ERROR({ error }: { error?: resError }) {
    this.populateError = error || null;
  }

  // action to populate a newly created node with settings
  @Action
  async dispatchPopulate() {
    if (!this.nodeId) {
      this.POPULATE_ERROR({
        error: Error("This node has not been created yet"),
      });
      return;
    }
    if (!this.nodeName) {
      this.POPULATE_ERROR({ error: Error("You must provide a node name") });
      return;
    }
    const res = await voltageFetch("/node/populate", {
      method: "POST",
      body: JSON.stringify({
        node_id: this.nodeId,
        name: this.nodeName,
        settings: Object.assign({}, this.settings, {
          // force sphinx creation as false for now
          sphinx: false,
          // alias should be node node on podcast nodes
          alias:
            this.planState.nodeType === Product.podcast
              ? this.nodeName
              : this.settings.alias,
        }),
      }),
    });
    const js = await res.json();
    if (!res.ok) {
      this.POPULATE_ERROR({ error: Error(js.message) });
      return;
    } else {
      this.POPULATE_ERROR({});
    }
  }

  // this is the string type required by the /node/create api
  get createType() {
    if (this.trial) return "trial";
    return this.planState.nodeType;
  }

  createError: resError = null;

  @Mutation
  CREATE_ERROR({ error }: { error?: resError }) {
    this.createError = error || null;
  }

  // action to /create the node
  @Action
  async dispatchCreate() {
    if (!this.network) {
      this.CREATE_ERROR({ error: Error("Bitcoin network is not selected") });
      return;
    }
    if (!this.createType) {
      this.CREATE_ERROR({ error: Error("The node type is not selected") });
      return;
    }
    const res = await voltageFetch("/node/create", {
      method: "POST",
      body: JSON.stringify({
        network: this.network,
        purchased_type: this.trial ? "trial" : "paid",
        type: this.createType === Product.podcast ? "lite" : this.createType,
        // pass the custom podcast role if this is a podcast node
        custom_roles:
          this.createType === Product.podcast ? ["podcast"] : undefined,
      }),
    });
    const js = await res.json();
    // handle error
    if (!res.ok) {
      console.error(js);
      this.CREATE_ERROR({ error: Error(js.message) });
      return;
    } else {
      // set the node id in this store from response
      this.NODE_ID(js.node_id);
      // autofill the users ip from response
      this.AUTOFILL_WHITELIST(js.user_ip);
      // set the create error to null
      this.CREATE_ERROR({});
      // incase flow is interupted, serialize
      this.SERIALIZE();
    }
  }
}
