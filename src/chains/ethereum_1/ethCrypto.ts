/* eslint-disable @typescript-eslint/no-unused-vars */
import ethUtil from 'ethereumjs-util'
import Wallet from 'ethereumjs-wallet'
import { toBuffer } from '../../helpers'
import { throwNewError } from '../../errors'
import { EthAddress, EthPublicKey, EthSignature, EthPrivateKey, ECDSASignature } from './models/cryptoModels'
import { toEthBuffer } from './helpers/generalHelpers'
import { isEncryptedDataString, encrypt, toEncryptedDataString } from '../../crypto'

export function sign(data: string | Buffer, privateKey: string): ECDSASignature {
  const dataBuffer = toEthBuffer(data)
  const keyBuffer = toBuffer(privateKey, 'hex')
  return ethUtil.ecsign(dataBuffer, keyBuffer)
}

export function isValidPrivateKey(value: EthPrivateKey): boolean {
  return ethUtil.isValidPrivate(value)
}

export function isValidPublicKey(value: EthPublicKey): boolean {
  return ethUtil.isValidPublic(value)
}

// For a given private key, pr, the Ethereum address A(pr) (a 160-bit value) to which it corresponds is defined as the right most 160-bits of the Keccak hash of the corresponding ECDSA public key.
export function isValidAddress(value: EthAddress): boolean {
  return ethUtil.isValidAddress(value)
}

export function getPublicKeyFromSignature(
  signature: EthSignature,
  data: string | Buffer,
  encoding: string,
): EthPublicKey {
  const { v, r, s } = signature
  return ethUtil.ecrecover(toEthBuffer(data), v, r, s)
}

/** Replaces unencrypted privateKey in keys object
 *  Encrypts key using password and salt */
export function encryptAccountPrivateKeysIfNeeded(keys: any, password: string, salt: string) {
  const { privateKey, publicKey } = keys
  const encryptedKeys = {
    privateKey: isEncryptedDataString(privateKey) ? privateKey : encrypt(privateKey, password, salt).toString(),
    publicKey,
  }
  return encryptedKeys
}

export function generateNewAccountKeysAndEncryptPrivateKeys(password: string, salt: string, overrideKeys: any): any {
  const wallet = Wallet.generate()
  const privateKey: EthPrivateKey = wallet.getPrivateKeyString()
  // TODO: eth address is commonely referred to as public key. However there is a difference b/w those two. So should we just call eth address as public key to reduce confusion??
  const publicKey: EthAddress = wallet.getAddressString()
  const keys = { privateKey, publicKey }
  const encryptedKeys = encryptAccountPrivateKeysIfNeeded(keys, password, salt)
  return encryptedKeys
}

// TODO: unless the data is signature, not sure what is the purpose of the function.  And how is it possibel to verify that the signature has what public key if the original data is not known
export function verifySignedWithPublicKey(
  publicKey: string | Buffer,
  data: string | Buffer,
  encoding: string,
): boolean {
  throwNewError('Not implemented')
  return false
}
