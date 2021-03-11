// This file contains info about different products that can be purchased

export enum Plan {
  yearly = "yearly",
  monthly = "monthly",
  payAsYouGo = "payAsYouGo",
  trial = "trial",
}

export enum Product {
  lite = "lite",
  standard = "standard",
  btcPay = "btcpayserver",
}

export interface Subscription<Plan, Product> {
  desc: string;
  name: string;
  cost: number;
  plan: Plan;
  nodeType: Product;
  // is this subscription type just btcpay server
}


export const litePlans: [
  Subscription<Plan.yearly, Product.lite>,
  Subscription<Plan.monthly, Product.lite>,
  Subscription<Plan.payAsYouGo, Product.lite>
] = [
  {
    desc:
      "One year of hosting for a Lightning node backed by Neutrino. Ideal for personal wallets or testing purposes.",
    name: "Lite Node/1Yr",
    cost: 9.99,
    plan: Plan.yearly,
    nodeType: Product.lite,
  },
  {
    desc:
      "One month of hosting for a Lightning node backed by Neutrino. Ideal for personal wallets or testing purposes.",
    name: "Lite Node/1Mo",
    cost: 12.99,
    plan: Plan.monthly,
    nodeType: Product.lite,
  },
  {
    desc:
      "Pay as you pricing for a Lightning node backed by Neutrino. Ideal for personal wallets or testing purposes",
    name: "Lite Node/Pay as you go",
    cost: 12.99,
    plan: Plan.payAsYouGo,
    nodeType: Product.lite,
  },
];

export const standardPlans: [
  Subscription<Plan.yearly, Product.standard>,
  Subscription<Plan.monthly, Product.standard>,
  Subscription<Plan.payAsYouGo, Product.standard>,
  Subscription<Plan.trial, Product.standard>
] = [
  {
    desc:
      "One year of hosting for a Lightning node backend by a Bitcoin Core node. Recommended option for anything outside of a personal wallet.",
    name: "Standard Node/1Yr",
    cost: 26.99,
    plan: Plan.yearly,
    nodeType: Product.standard,
  },
  {
    desc:
      "One month of hosting for a Lightning node backend by a Bitcoin Core node. Recommended option for anything outside of a personal wallet.",
    name: "Standard Node/1Mo",
    cost: 31.99,
    plan: Plan.monthly,
    nodeType: Product.standard,
  },
  {
    desc:
      "Pay as you pricing for a Lightning node backed by a Bitcoin Core node. Recommended optin for anything outside of a personal wallet",
    name: "Standard Node/Pay as you go",
    cost: 31.99,
    plan: Plan.payAsYouGo,
    nodeType: Product.standard,
  },
  {
    desc:
      "7 day free trial of a lightning node backed by a Bitcoin Core node on the bitcoin testnet. This node can only transact in test bitcoins and will expire after 7 days",
    name: "Standard Node/Trial",
    cost: 0.0,
    plan: Plan.trial,
    nodeType: Product.standard,
  },
];

export const btcPayOnlyPlans: [
  Subscription<Plan.yearly, Product.btcPay>,
  Subscription<Plan.monthly, Product.btcPay>
] = [
  {
    desc:
      "One BTCPay Server account for one year. This option doesn't include any Lightning nodes. However, you can add Lightning nodes later.",
    name: "BTCPay Server/1Yr",
    cost: 6.99,
    plan: Plan.yearly,
    nodeType: Product.btcPay,
  },
  {
    desc:
      "One BTCPay Server account for one month. This option doesn't include any Lightning nodes. However, you can add Lightning nodes later.",
    name: "BTCPay Server/1Mo",
    cost: 8.99,
    plan: Plan.monthly,
    nodeType: Product.btcPay,
  },
];
