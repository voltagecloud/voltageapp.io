
export enum Plan {
  yearly = "yearly",
  monthly = "monthly",
}

export enum NodeType {
  lite = "lite",
  standard = "standard",
  btcPay = "btcpayserver",
}

export interface Subscription {
  desc: string;
  name: string;
  cost: number;
  plan: Plan;
  nodeType: NodeType;
  // is this subscription type just btcpay server
}
export const litePlans: Subscription[] = [
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
export const standardPlans: Subscription[] = [
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
export const btcPayOnlyPlans: Subscription[] = [
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

