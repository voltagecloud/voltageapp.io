import * as bip39 from 'bip39'
import * as bip32 from 'bip32'

const keyPath = `m/84'/0'/0'`

export async function mnemonicToXPub (mnemonic: string) {
  const seed = await bip39.mnemonicToSeed(mnemonic)
  const master = bip32.fromSeed(seed)
  const fingerprint = master.fingerprint.toString('hex')
  const account = master.derivePath(keyPath)
  const xPubString = account.neutered().toBase58()
  return { xPubString, fingerprint }
}

export async function generateNewXPub () {
  const mnemonic =  bip39.generateMnemonic()
  const { xPubString, fingerprint } = await mnemonicToXPub(mnemonic)
  return { mnemonic, xPubString, fingerprint }
}