import crypto from 'crypto'
import { throwNewError } from '../errors'
import { asyncForEach, isNullOrEmpty, jsonParseAndRevive } from '../helpers'
import { KeyPair, PrivateKey, PublicKey } from '../models'
import { toAsymEncryptedDataString } from './asymmetric'
import {
  AsymmetricEncryptedData,
  AsymmetricEncryptedDataString,
  EciesCurveType,
  EciesOptions,
} from './asymmetricModels'
import { ensureEncryptedValueIsObject } from './genericCryptoHelpers'

/** Use assymmetric encryption with multiple public keys - wrapping with each
 *  Returns an array of results with the last one including the final cipertext
 *  Encrypts using publicKeys in the order they appear in the array */
export async function encryptWithPublicKeys(
  encryptCallback: (unencrypted: string, publicKey: PublicKey, options: EciesOptions) => Promise<string>,
  unencrypted: string,
  publicKeys: PublicKey[],
  options?: EciesOptions,
): Promise<AsymmetricEncryptedDataString> {
  const result: AsymmetricEncryptedData[] = []
  let valueToBeEncrypted = unencrypted
  // loop through the public keys and wrap encrypted text once for each
  await asyncForEach(publicKeys, async (pk: PublicKey, index: number) => {
    const lastEncrypted: AsymmetricEncryptedData = jsonParseAndRevive(
      await encryptCallback(valueToBeEncrypted, pk, options),
    )
    // for each pass, encrypt the result of the last encryption
    valueToBeEncrypted = lastEncrypted.ciphertext
    if (index !== publicKeys.length - 1) delete lastEncrypted.ciphertext // if not in the last loop, drop the ciphertext from the result
    lastEncrypted.seq = index
    result.push(lastEncrypted)
  })
  return toAsymEncryptedDataString(JSON.stringify(result))
}

/** Unwraps an object produced by encryptWithPublicKeys() - resulting in the original ecrypted string (or the remaining encrypted payload)
 *  each pass uses a private keys from privateKeys array - in the order appearing in the array - in same order of public keys provided to encryptWithPublicKeys() - they will be applied in the right (reverse) order
 *  If only some of the private keys are provided, if most be the last n keys (provided in same order as when encrypted) e.g. [key3, key4] where key1, key2 will be used later to finish decrypting the remaining payload
 *  Returns:    decrypted - If all keys were provided. The result is the original string that was encrypted
 *           OR remaining - If only some of the private keys provided. Returns array of encrypted blobs that are remaining after unwrapping with the private keys provided */
export async function decryptWithPrivateKeys(
  decryptCallback: (
    encryptedItem: AsymmetricEncryptedData,
    privateKey: PrivateKey,
    options: EciesOptions,
  ) => Promise<string>,
  encrypted: string,
  privateKeys: PrivateKey[],
  options: EciesOptions,
): Promise<{ decrypted: string; remaining: AsymmetricEncryptedData[] }> {
  let encryptedObject = ensureEncryptedValueIsObject(encrypted) as AsymmetricEncryptedData[]
  // sort encrypted blobs - in FORWARD order of seq
  encryptedObject = encryptedObject.sort((a, b) => (a.seq > b.seq ? 1 : -1)) // reverse sort by seq number
  if (!Array.isArray(encryptedObject) || isNullOrEmpty(encryptedObject)) {
    throwNewError('decryptWithPrivateKeys: encryptedItem is not array of type EncryptedAsymmetric')
  }
  let lastValueDecrypted: string
  let blobsToReturn: AsymmetricEncryptedData[]

  // sort encrypted blobs - in REVERSE order of seq
  const blobsReversed = (encryptedObject as AsymmetricEncryptedData[]).sort((a, b) => (a.seq < b.seq ? 1 : -1)) // reverse sort by seq number
  let privateKeyIndex = privateKeys.length - 1 // start at end
  let decryptedCount = 0

  // loop through blobs in REVERSE order of encryption
  await asyncForEach(blobsReversed, async encryptedItem => {
    if (privateKeyIndex < 0) return // we might have fewer keys than blobs, stop unwrapping when we run out of keys
    // eslint-disable-next-line no-param-reassign
    if (!encryptedItem?.ciphertext) encryptedItem.ciphertext = lastValueDecrypted
    lastValueDecrypted = await decryptCallback(encryptedItem, privateKeys[privateKeyIndex], options)
    decryptedCount += 1
    privateKeyIndex -= 1 // step in reverse order
    // we've unwrapped as many keys as we have - return the rest of the unencrypted blobs
    if (decryptedCount === privateKeys.length && encryptedObject.length > privateKeys.length) {
      blobsToReturn = encryptedObject.slice(decryptedCount) // remove the just decrypted blobs
      blobsToReturn[0].ciphertext = lastValueDecrypted
    }
  })
  return { decrypted: lastValueDecrypted, remaining: blobsToReturn }
}

/** generates a new ECDSA private/public keypair */
export function generateKeyPair(curveType: EciesCurveType, format: crypto.ECDHKeyFormat = 'uncompressed'): KeyPair {
  const ecdh = crypto.createECDH(curveType)
  ecdh.generateKeys(null, format)
  return {
    publicKey: ecdh.getPublicKey('hex', format),
    privateKey: ecdh.getPrivateKey('hex'),
  }
}
