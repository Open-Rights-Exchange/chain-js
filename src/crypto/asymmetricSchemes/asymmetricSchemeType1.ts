/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { generateMessageHash, generateMessageMac } from './asymmetricSchemeHelpers'
import { AsymmetricSchemeGenerator, EciesOptions, AsymmetricScheme, SymmetricCypherType } from '../asymmetricModels'

/** This example demonstrates how to create a custom scheme to generate the ciper key and mac key for an asym encryption
 *  There is some variability in how someone would contruct these keys (e.g. compressed vs uncompressed public key)
 *  By creating a customHashGenerator() and/or customMacGenerator function, we can control the approach
 */

function messageKeyGenerator( sharedSecret: Buffer | Uint8Array,
  s1: Buffer,
  ephemKeyBuffer: Buffer ) {

  const counter1 = Buffer.from('00000001', 'hex')
  const counter2 = Buffer.from('00000002', 'hex')
  // uses KDF to derive a symmetric encryption and a MAC keys:
  // Ke || Km = KDF(S || S1)
  const hash = generateMessageHash(
    SymmetricCypherType.Sha256,
    Buffer.concat(
      [sharedSecret, counter1, s1, ephemKeyBuffer],
      sharedSecret.length + s1.length + ephemKeyBuffer.length + counter1.length,
    ),
  )
  const hash2 = generateMessageHash(
    SymmetricCypherType.Sha256,
    Buffer.concat(
      [sharedSecret, counter2, s1, ephemKeyBuffer],
      sharedSecret.length + s1.length + ephemKeyBuffer.length + counter2.length,
    ),
  )
  const cipherKey = hash
  const macKey = hash2.slice(0, hash2.length / 2)

  return {cipherKey, macKey}
}

function macGenerator( macKey?: Buffer, s2?: Buffer, cipherText?: Buffer ) {
  // computes the tag of encrypted message and S2:
  // d = MAC(Km; c || S2)
  const mac = generateMessageMac(
    SymmetricCypherType.Sha256,
    macKey,
    Buffer.concat([cipherText, s2], cipherText.length + s2.length),
  )

  return mac.slice(0, mac.length / 2)
}

export const asymmetricSchemeType1: AsymmetricSchemeGenerator = {
  scheme: AsymmetricScheme.SECP256K1_TYPE1,
  messageKeyGenerator,
  macGenerator,
}
