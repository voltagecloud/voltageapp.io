import { Address4, Address6 } from 'ip-address'

export interface IDName {
    node_id: string
    node_name: string
}

export enum NodeStatus {
    creating = 'creating',
    running = 'running',
    failed = 'failed',
    unknown ='unknown',
    stopped = 'stopped',
    stopping = 'stopping',
    deleted = 'deleted',
    expired = 'expired'
}

export enum Network {
    testnet = 'testnet',
    mainnet = 'mainnet'
}

export interface Settings {
    autopilot: Boolean
    grpc: Boolean
    rest: Boolean
    tor: Boolean
    keysend: Boolean
    whitelist: Array<Address4|Address6>
}
