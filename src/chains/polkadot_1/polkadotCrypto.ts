import { 
  PolkadotAddress, 
  PolkadotPublicKey, 
  PolkadotKeypair, 
  PolkadotKeypairType
} from "./models"
import { u8aToHex } from '@polkadot/util'
import { 
  mnemonicGenerate, 
  mnemonicToMiniSecret, 
  signatureVerify, 
} from '@polkadot/util-crypto'
import { 
  encodeAddress, 
  decodeAddress, 
  naclKeypairFromSeed as naclFromSeed, 
  schnorrkelKeypairFromSeed as schnorrkelFromSeed, 
  secp256k1KeypairFromSeed as secp256k1FromSeed, 
} from '@polkadot/util-crypto'

export const keypairFromSeed = {
  ecdsa: (seed: Uint8Array): PolkadotKeypair => secp256k1FromSeed(seed) as PolkadotKeypair,
  ed25519: (seed: Uint8Array): PolkadotKeypair => naclFromSeed(seed) as PolkadotKeypair,
  sr25519: (seed: Uint8Array): PolkadotKeypair => schnorrkelFromSeed(seed) as PolkadotKeypair
}

export function getPolkadotAddressFromPublicKey(publicKey: PolkadotPublicKey): PolkadotAddress {
  return encodeAddress(publicKey)
}

export function generateNewAccountPhrase(): string {
  const mnemonic = mnemonicGenerate()
  return mnemonic
}

export function generateNewKeyPair(type: PolkadotKeypairType): PolkadotKeypair {
  const mnemonic = generateNewAccountPhrase()
  const seed = mnemonicToMiniSecret(mnemonic)
  const keyPair = keypairFromSeed[type](seed)
  return keyPair
}

export function verifySignatureWithAddress(signedMessage: string, signature: string, address: PolkadotPublicKey): boolean {
  const publicKey = decodeAddress(address);
  const hexPublicKey = u8aToHex(publicKey);

  return signatureVerify(signedMessage, signature, hexPublicKey).isValid;
}