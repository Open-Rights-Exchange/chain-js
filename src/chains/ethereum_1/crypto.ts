/* eslint-disable @typescript-eslint/no-unused-vars */
import { throwNewError } from '../../errors'

export function sign(data: string | Buffer, privateKey: string): string {
  throwNewError('Not implemented')
  return 'string'
}

export function isValidPrivateKey(value: string): boolean {
  throwNewError('Not implemented')
  return false
}

export function isValidPublicKey(value: string): boolean {
  throwNewError('Not implemented')
  return false
}

export function getPublicKeyFromSignature(signature: string | Buffer, data: string | Buffer, encoding: string): string {
  throwNewError('Not implemented')
  return 'string'
}

export function generateNewAccountKeysAndEncryptPrivateKeys(password: string, salt: string, overrideKeys: any): any {
  throwNewError('Not implemented')
  return {}
}

export function verifySignedWithPublicKey(
  publicKey: string | Buffer,
  data: string | Buffer,
  encoding: string,
): boolean {
  return false
}
