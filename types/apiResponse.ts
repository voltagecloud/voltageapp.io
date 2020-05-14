import { Network, Settings, NodeStatus, IDName } from '~/types/api'

export enum PurchasedType {
    paid = 'paid',
    trial = 'trial'
}

export interface NodeSeed {
    name: string
    network: Network
    seed: string[]
}

export interface Node {
    node_id: string
    owner: string
    node_name: string
    public_key: string
    onion_address: string
    api_endpoint: string
    status: NodeStatus
    network: Network
    expires: string
    creation_date: string
    settings: Settings
    purchased_type: PurchasedType
}

export interface NodeStatusUpdate {
    node_id: string
    owner: string
    node_name: string
    public_key: string
    onion_address: string
    api_endpoint: string
    status: NodeStatus
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