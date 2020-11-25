import { asyncForEach } from '../helpers'
import { PrivateKey, PublicKey } from '../models'
import * as Asymmetric from './asymmetric'
import { ensureEncryptedValueIsObject } from './cryptoHelpers'

/** Use assymmetric encryption with multiple public keys - wrapping with each
 *  Returns an array of results with the last one including the final cipertext
 *  Encrypts using publicKeys in the order they appear in the array */
export async function encryptWithPublicKeys(
  encryptCallback: (unencrypted: string, publicKey: PublicKey, options: Asymmetric.EciesOptions) => Promise<string>,
  unencrypted: string,
  publicKeys: PublicKey[],
  options?: Asymmetric.EciesOptions,
): Promise<string> {
  const result: Asymmetric.WrappedAsymmetricEncrypted = {}
  let valueToBeEncrypted = unencrypted
  // loop through the public keys and wrap encrypted text once for each
  await asyncForEach(publicKeys, async (pk: PublicKey, index: number) => {
    const lastEncrypted: Asymmetric.EncryptedAsymmetric = JSON.parse(
      await encryptCallback(valueToBeEncrypted, pk, options),
    )
    // for each pass, encrypt the result of the last encryption
    valueToBeEncrypted = lastEncrypted.ciphertext
    if (index !== publicKeys.length - 1) delete lastEncrypted.ciphertext // if not in the last loop, drop the ciphertext from the result
    result[index] = lastEncrypted
  })
  return JSON.stringify(result)
}

/** Unwraps an object produced by encryptWithPublicKeys() - resulting in the original ecrypted string
 *  each pass uses the private keys in the order appearing in the array - in same order of public keys provided to encryptWithPublicKeys()
 *  The result is the decrypted string */
export async function decryptWithPrivateKeys(
  decryptCallback: (
    encryptedItem: Asymmetric.EncryptedAsymmetric,
    privateKey: PrivateKey,
    options: Asymmetric.EciesOptions,
  ) => Promise<string>,
  encrypted: string,
  privateKeys: PrivateKey[],
  options: Asymmetric.EciesOptions,
): Promise<string> {
  const encryptedObject = ensureEncryptedValueIsObject(encrypted)
  let lastValueDecrypted: string

  // loop through the encrypted blobs in reverse order
  await asyncForEach(
    Object.entries(encryptedObject).reverse(),
    async ([indexString, encryptedItem]: [string, Asymmetric.EncryptedAsymmetric]) => {
      // eslint-disable-next-line no-param-reassign
      if (!encryptedItem?.ciphertext) encryptedItem.ciphertext = lastValueDecrypted
      lastValueDecrypted = await decryptCallback(encryptedItem, privateKeys[parseInt(indexString, 10)], options)
    },
  )
  return lastValueDecrypted
}
