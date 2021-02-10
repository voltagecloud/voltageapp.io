import { Address4, Address6 } from 'ip-address'

export interface IDName {
    node_id: string
    node_name: string
    created?: string
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
    expired = 'expired',
    restarting = 'restarting',
    unlocking = 'unlocking',
    initializing = 'initializing'
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
    wumbo: boolean
    webhook: string
    alias: string
    color: string
    whitelist: Array<Address4|Address6>
    minchansize: string
    maxchansize: string
    autocompaction: boolean
    defaultfeerate: string
    sphinx: boolean
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

export enum DashboardData {
    thunderhub = 'thunderhub'
}
