import { Network, Settings, NodeStatus } from '~/types/api'

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
    created: string
    settings: Settings
}