import { Address4, Address6 } from 'ip-address'

export interface IDName {
    node_id: string
    node_name: string
}

export enum NodeStatus {
    provisioning = 'provisioning',
    starting = 'starting',
    stopping = 'stopping',
    running = 'running',
    stopped = 'stopped',
    failed = 'failed',
    waiting_init = 'waiting_init',
    waiting_unlock = 'waiting_unlock',
    deleted = 'deleted',
    expired = 'expired'
}

export enum Network {
    testnet = 'testnet',
    mainnet = 'mainnet'
}

export interface Settings {
    autopilot: boolean
    grpc: boolean
    rest: boolean
    tor: boolean
    keysend: boolean
    alias: string
    color: string
    whitelist: Array<Address4|Address6>
}

export enum MacaroonLevel {
    walletkit = 'walletkit',
    signer = 'signer',
    router = 'router',
    readonly = 'readonly',
    invoice = 'invoice',
    invoices = 'invoices',
    chainnotifier = 'chainnotifier',
    admin = 'admin'
}

export enum ApiType {
    grpc = 'grpc',
    rest = 'rest'
}


export enum ExportData {
    full = 'full',
    log = 'log',
    channelbackup = 'channelbackup',
    tls = 'tls'
}