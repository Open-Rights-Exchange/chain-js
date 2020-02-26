/* eslint-disable @typescript-eslint/no-unused-vars */
import ethUtil from 'ethereumjs-util'
import { isAString } from '../../helpers'
import { PublicKey, Signature } from '../../models'
import { throwNewError } from '../../errors'
import { EthSignature } from './models/cryptoModels'

// TODO
export function sign(data: string | Buffer, privateKey: string): EthSignature {
  const dataBuffer = ethUtil.toBuffer(data)
  const keyBuffer = Buffer.from(privateKey, 'hex')
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
  signature: string | Buffer,
  data: string | Buffer,
  encoding: string,
): PublicKey {
  throwNewError('Not implemented')
  return null
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
