import * as nacl from 'tweetnacl'
import { encodeBase64, encodeUTF8, decodeBase64, decodeUTF8 } from 'tweetnacl-util'
import { EncryptedDataString, Signature } from '../../models'
import { AlgorandPrivateKey, AlgorandSignature, AlgorandPublicKey } from './models/cryptoModels'

const newNonce = () => nacl.randomBytes(nacl.secretbox.nonceLength)

/** Converts a string to uint8 array */
function toUnit8Array(encodedString: string) {
  return decodeUTF8(encodedString)
}

function toStringFromUnit8Array(array: Uint8Array) {
  return encodeUTF8(array)
}

/** Encrypts a string using a password and a nonce */
export function encrypt(unencrypted: string, password: string): EncryptedDataString {
  const keyUint8Array = decodeBase64(password)
  const nonce = newNonce()
  const messageUint8 = decodeUTF8(unencrypted)
  const box = nacl.secretbox(messageUint8, nonce, keyUint8Array)

  const fullMessage = new Uint8Array(nonce.length + box.length)
  fullMessage.set(nonce)
  fullMessage.set(box, nonce.length)

  const base64FullMessage = encodeBase64(fullMessage)
  return base64FullMessage as EncryptedDataString
}

/** Decrypts the encrypted value using a password, ausing nacl
 * The encrypted value is either a stringified JSON object */
export function decrypt(encrypted: EncryptedDataString | any, password: string): string {
  const keyUint8Array = decodeBase64(password)
  const messageWithNonceAsUint8Array = decodeBase64(encrypted)
  const nonce = messageWithNonceAsUint8Array.slice(0, nacl.secretbox.nonceLength)
  const message = messageWithNonceAsUint8Array.slice(nacl.secretbox.nonceLength, encrypted.length)

  const decrypted = nacl.secretbox.open(message, nonce, keyUint8Array)

  if (!decrypted) {
    throw new Error('Could not decrypt message')
  }

  const base64DecryptedMessage = encodeUTF8(decrypted)
  return base64DecryptedMessage
}

/** Signs a string with a private key */
export function sign(data: string, privateKey: AlgorandPrivateKey | string): AlgorandSignature {
  const signature = nacl.sign.detached(toUnit8Array(data), toUnit8Array(privateKey))
  return toStringFromUnit8Array(signature) as AlgorandSignature
}

// export function getPublicKeyFromSignature(
//   signature: Signature | AlgorandSignature | string | Buffer,
//   data: string | Buffer,
// ): AlgorandPublicKey {}
