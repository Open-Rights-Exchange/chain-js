import * as ecc from 'eosjs-ecc'
import { isEncryptedDataString, encrypt, toEncryptedDataString } from '../../crypto'
import { TRANSACTION_ENCODING } from './eosConstants'
import { EosAccountKeysStruct, EosSignature, EosPublicKey, EosPrivateKey } from './models'
import { KeyPair, KeyPairEncrypted, Signature } from '../../models'
import { throwNewError } from '../../errors'
import { isNullOrEmpty, removeEmptyValuesInJsonObject } from '../../helpers'
import { toEosPublicKey } from './helpers'

const { Keygen } = require('eosjs-keygen')

// OREJS Ported functions
// generateAndEncryptOwnerActiveKeys() {} // generateEncryptedKeys

export function sign(
  data: string | Buffer,
  privateKey: EosPrivateKey | string,
  encoding: string = TRANSACTION_ENCODING,
): EosSignature {
  return ecc.sign(data, privateKey, encoding)
}

export function getPublicKeyFromSignature(
  signature: Signature | EosSignature | string | Buffer,
  data: string | Buffer,
  encoding: string = TRANSACTION_ENCODING,
): EosPublicKey {
  return ecc.recover(signature, data, encoding)
}

export function verifySignedWithPublicKey(
  publicKey: EosSignature | Buffer,
  data: string | Buffer,
  encoding: string = TRANSACTION_ENCODING,
): boolean {
  return ecc.verify(data, publicKey, encoding)
}

export async function generateRawKeyPair(): Promise<KeyPair> {
  const privateKey = await ecc.randomKey()
  const publicKey = ecc.privateToPublic(privateKey) // EOSkey...
  return { private: privateKey, public: publicKey }
}

/** Replaces unencrypted privateKeys (owner and active) in keys object
 *  Encrypts keys using password and salt */
export function encryptAccountPrivateKeysIfNeeded(keys: any, password: string, salt: string) {
  const { privateKeys, publicKeys } = keys
  const encryptedKeys = {
    privateKeys: {
      owner: isEncryptedDataString(privateKeys.owner)
        ? privateKeys.owner
        : encrypt(privateKeys.owner, password, salt).toString(),
      active: isEncryptedDataString(privateKeys.active)
        ? privateKeys.active
        : encrypt(privateKeys.active, password, salt).toString(),
    },
    publicKeys: { ...publicKeys },
  }
  return encryptedKeys
}

/** Generates new owner and active key pairs (public and private)
 *  Encrypts private keys with provided password and salt
 *  Returns: { publicKeys:{owner, active}, privateKeys:{owner, active} } */
export async function generateNewAccountKeysAndEncryptPrivateKeys(
  password: string,
  salt: string,
  overrideKeys: any = {},
) {
  // remove any empty values passed-in (e.g. active=undefined or '' )
  removeEmptyValuesInJsonObject(overrideKeys)

  // Formally named generateEncryptedKeys
  const keys: EosAccountKeysStruct = await Keygen.generateMasterKeys()
  const replacedKeys = {
    publicKeys: {
      ...keys.publicKeys,
      ...overrideKeys.publicKeys,
    },
    privateKeys: {
      ...keys.privateKeys,
      ...overrideKeys.privateKeys,
    },
  }
  const encryptedKeys = encryptAccountPrivateKeysIfNeeded(replacedKeys, password, salt)
  return encryptedKeys
}

/** Generate a random private/public key pair and encrypt using provided password and salt */
export async function generateKeyPairAndEncryptPrivateKeys(password: string, salt: string): Promise<KeyPairEncrypted> {
  if (isNullOrEmpty(password)) throwNewError('generateKeyPairAndEncryptPrivateKeys: Must provide password for new keys')
  if (isNullOrEmpty(salt)) throwNewError('generateKeyPairAndEncryptPrivateKeys: Must provide salt for new keys')
  const keys = await generateRawKeyPair()
  return {
    public: toEosPublicKey(keys.public),
    privateEncrypted: toEncryptedDataString(encrypt(keys.private, password, salt)),
  }
}
