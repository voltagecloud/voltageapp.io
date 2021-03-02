import * as bip39 from 'bip39'
import * as bip32 from 'bip32'

export async function mnemonicToXPub (mnemonic: string) {
  const seed = await bip39.mnemonicToSeed(mnemonic)
  const node = bip32.fromSeed(seed)
  const xPubString = node.neutered().toBase58()

  return xPubString
}

export async function generateNewXPub () {
  const mnemonic =  bip39.generateMnemonic()
  const xPubString = await mnemonicToXPub(mnemonic)

  return { mnemonic, xPubString }
}

