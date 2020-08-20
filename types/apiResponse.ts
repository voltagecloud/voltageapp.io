import { Network, Settings, NodeStatus, IDName, ExportData } from '~/types/api'

export enum PurchasedType {
    paid = 'paid',
    trial = 'trial'
}

export interface CheckInvite {
    granted: boolean
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
    settings: Settings
    volt_version: String
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
    purchased_nodes: number
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
