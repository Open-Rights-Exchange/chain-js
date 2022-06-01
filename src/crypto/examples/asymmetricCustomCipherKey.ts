/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { EciesOptions, AsymmetricScheme, SymmetricCypherType } from '../asymmetricModels'
import { decryptWithPrivateKey, encryptWithPublicKey } from '../asymmetric'
import { Asymmetric } from '..'

/** This example demonstrates how to create a custom scheme to generate the ciper key and mac key for an asym encryption
 *  There is some variability in how someone would contruct these keys (e.g. compressed vs uncompressed public key)
 *  By creating a customHashGenerator() and/or customMacGenerator function, we can control the approach
 */

async function run() {
  const toEncrypt = 'messageToEncrypt'

  const publicWrappingKey = '0450863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b23522cd470243453a299fa9e77237716103abc11a1df38855ed6f2ee187e9c582ba6'
  const options: EciesOptions = {
    curveType: Asymmetric.EciesCurveType.Secp256k1,
    symmetricCypherType: SymmetricCypherType.Aes256Ctr,
    keyFormat: 'compressed',
    s1: 'ore1rngq1jyx',
    scheme: AsymmetricScheme.SECP256K1_TYPE1,
  }   
  const encryptResult = encryptWithPublicKey(publicWrappingKey, toEncrypt, options)

  const {ephemPublicKey, ciphertext, mac} = encryptResult

  const payload = ephemPublicKey + ciphertext + mac

  console.log('encrypted payload:', payload)
  console.log('encrypted payload:', encryptResult)

  const decryptedPayload = await decryptWithPrivateKey(encryptResult, '18E14A7B6A307F426A94F8114701E7C8E774E7F9A47E2C2035DB29A206321725', options)
  console.log('decrypted payload:', decryptedPayload)
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()