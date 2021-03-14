import { Module, VuexModule, Mutation } from "vuex-module-decorators";
import { Address4, Address6 } from "ip-address";
import { Network, Settings } from "~/types/api";
import {
  standardPlans,
  Subscription,
  Plan,
  Product,
} from "~/utils/voltageProducts";

export interface Cart {
  items: {
    plan: string;
    quantity: number;
    type: string;
  }[];
}

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
  network: Network = Network.testnet;
  // is this a trial node
  trial = false;
  // seed for the lnd wallet
  seed: string[] = [];
  // password to encrypt the backup data
  password: string = "";
  // should the admin macaroon be backed up on creation
  macaroon_backup = true;
  // setttings this node should be creatd with
  settings: Settings = Object.assign({}, defaultSettings);

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
  PASSWORD(password: string) {
    this.password = password;
  }

  @Mutation
  MACAROON_BACKUP(v: boolean) {
    this.macaroon_backup = v;
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
      macaroon_backup: this.macaroon_backup,
      settings: this.settings,
      nodeId: this.nodeId,
      referralCode: this.referralCode,
      planState: this.planState,
      planQty: this.planQty,
      includeBtcPay: this.includeBtcPay,
    };
    window.localStorage.setItem("createStore", JSON.stringify(data));
  }

  @Mutation
  CLEAR () {
    this.nodeName = ''
    this.trial = false
    this.macaroon_backup = true
    this.nodeId = ''
    this.referralCode = ''
    this.planState = Object.assign({}, standardPlans[0])
    this.planQty = 1
    this.includeBtcPay = false
  }

  @Mutation
  DESERIALIZE() {
    const cartData = window.localStorage.getItem("createStore");
    if (!cartData) return;
    const js = JSON.parse(cartData);
    this.nodeName = js.nodeName;
    this.network = js.network;
    this.trial = js.trial;
    this.macaroon_backup = js.macaroon_backup;
    this.settings = js.settings;
    this.nodeId = js.nodeId;
    this.referralCode = js.referralCode;
    this.planState = js.planState;
    this.planQty = js.planQty;
    this.includeBtcPay = js.includeBtcPay;
  }
}
