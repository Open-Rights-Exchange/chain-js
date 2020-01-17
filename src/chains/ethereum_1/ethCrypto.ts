/* eslint-disable @typescript-eslint/no-unused-vars */
import { PublicKey, Signature } from '../../models'
import { throwNewError } from '../../errors'

export function sign(data: string | Buffer, privateKey: string): Signature {
  throwNewError('Not implemented')
  return null
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
