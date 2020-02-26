/* eslint-disable @typescript-eslint/no-unused-vars */
import ethUtil from 'ethereumjs-util'
import { isAString, toBuffer } from '../../helpers'
import { PublicKey, Signature } from '../../models'
import { throwNewError } from '../../errors'
import { EthPublicKey, EthSignature } from './models/cryptoModels'
import { toEthBuffer } from './helpers/generalHelpers'

// TODO
export function sign(data: string | Buffer, privateKey: string): EthSignature {
  const dataBuffer = toEthBuffer(data)
  const keyBuffer = toBuffer(privateKey, 'hex')
  return ethUtil.ecsign(dataBuffer, keyBuffer)
}

export function isValidPrivateKey(value: string): boolean {
  throwNewError('Not implemented')
  return false
}

export function isValidPublicKey(value: string): boolean {
  throwNewError('Not implemented')
  return false
}

export function getPublicKeyFromSignature(
  signature: EthSignature,
  data: string | Buffer,
  encoding: string,
): EthPublicKey {
  const { v, r, s } = signature
  return ethUtil.ecrecover(toEthBuffer(data), v, r, s)
}

export function generateNewAccountKeysAndEncryptPrivateKeys(password: string, salt: string, overrideKeys: any): any {
  throwNewError('Not implemented')
  return null
}

export function verifySignedWithPublicKey(
  publicKey: string | Buffer,
  data: string | Buffer,
  encoding: string,
): boolean {
  throwNewError('Not implemented')
  return false
}
