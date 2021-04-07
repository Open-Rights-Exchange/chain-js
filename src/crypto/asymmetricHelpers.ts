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

/** Unwraps an object produced by encryptWithPublicKeys() - resulting in the original ecrypted string
 *  each pass uses the private keys in the order appearing in the array - in same order of public keys provided to encryptWithPublicKeys()
 *  The result is the decrypted string */
export async function decryptWithPrivateKeys(
  decryptCallback: (
    encryptedItem: AsymmetricEncryptedData,
    privateKey: PrivateKey,
    options: EciesOptions,
  ) => Promise<string>,
  encrypted: string,
  privateKeys: PrivateKey[],
  options: EciesOptions,
): Promise<string> {
  const encryptedObject = ensureEncryptedValueIsObject(encrypted)
  if (!Array.isArray(encryptedObject) || isNullOrEmpty(encryptedObject)) {
    throwNewError('decryptWithPrivateKeys: encryptedItem is not array of type EncryptedAsymmetric')
  }
  let lastValueDecrypted: string

  // sort encrypted blobs - in REVERSE order of seq
  const blobsReversed = (encryptedObject as AsymmetricEncryptedData[]).sort((a, b) => (a.seq < b.seq ? 1 : -1)) // reverse sort by seq number
  let index = blobsReversed.length - 1 // start at end

  // loop through blobs in REVERSE order of encryption
  await asyncForEach(blobsReversed, async encryptedItem => {
    // eslint-disable-next-line no-param-reassign
    if (!encryptedItem?.ciphertext) encryptedItem.ciphertext = lastValueDecrypted
    lastValueDecrypted = await decryptCallback(encryptedItem, privateKeys[index], options)
    index -= 1 // step in reverse order
  })
  return lastValueDecrypted
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
