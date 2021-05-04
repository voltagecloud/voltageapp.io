import { Network, Settings, NodeStatus, IDName, ExportData, DashboardData } from '~/types/api'

export enum PurchasedType {
    paid = 'paid',
    trial = 'trial',
    ondemand = 'ondemand'
}

export enum NodeSoftware {
    lnd = 'lnd',
    bitcoind = 'bitcoind',
    btcd = 'btcd'
}

export interface NodeSeed {
    name: string
    network: Network
    seed: string[]
}

export interface CreateNode {
    node_id: string
    owner_id: string
    network: Network
    expires: string
    created: string
    purchased_type: PurchasedType
    purchase_status: string
    type: string
    user_ip: string
}

export interface PopulateNode extends CreateNode {
    node_name: string
    api_endpoint: string
    status: NodeStatus
    update_available: boolean
    lnd_version: string
    tls_cert: string
    macaroon_backup: boolean
    macaroons: string[]
}

export interface Node extends PopulateNode {
    node_type: NodeSoftware.lnd
    settings: Settings
    volt_version: String
    custom_roles?: String[]
}

interface BitcoinNode {
    api_endpoint: string;
    created: string;
    expires: string;
    network: Network;
    node_id: string;
    node_name: string;
    owner_id: string;
    password: string;
    purchase_status: string;
    purchased_type: string;
    status: string;
    type: string;
    username: string;
    volt_version: string;
}

export interface BitcoindNode extends BitcoinNode {
    bitcoind_version: string;
    node_type: NodeSoftware.bitcoind;
}

export interface BtcdNode extends BitcoinNode {
    btcd_version: string;
    node_type: NodeSoftware.btcd
}

export interface NodeExport {
    name: string
    status: NodeExportStatus
    type: ExportData
    node_id: string
    owner_id: string
    export_id: string
    expires: string
    url: string
}

export enum NodeExportStatus {
    pending = 'pending',
    created = 'created',
    failed = 'failed'
}

export interface NodeDashboard {
    dashboard_id: string
    dashboard_name: string
    status: NodeDashboardStatus
    node_id: string
    node_name: string
    created: string
    type: DashboardData
    owner_id: string
    endpoint: string
}

export enum NodeDashboardStatus {
    provisioning = 'provisioning',
    running = 'running',
    failed = 'failed',
    stopped = 'stopped',
    deleted = 'deleted'
}

export interface NodeStatusUpdate {
    node_id: string
    owner: string
    node_name: string
    public_key: string
    onion_address: string
    api_endpoint: string
    status: NodeStatus
    update_available: boolean
    network: Network
}

export interface User {
    user_id: string
    email: string
    email_verified: boolean
    phone: number
    phone_verified: boolean
    trial_available: boolean
    available_nodes: number
    available_lite_nodes: number
    purchased_nodes: number
    purchased_lite_nodes: number
    mainnet_nodes: IDName[]
    testnet_nodes: IDName[]
    deleted_mainnet_nodes: IDName[]
    deleted_testnet_nodes: IDName[]
}

export interface Connect {
    endpoint: string
    lndconnect_uri: string
}

export interface NodeNameResponse {
    taken: boolean
    valid: boolean
    node_name: string
}

export interface PaymentSession {
    session_id: string
}
