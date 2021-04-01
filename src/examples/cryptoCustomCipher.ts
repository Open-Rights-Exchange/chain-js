/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { EciesOptions } from '../crypto/asymmetricModels'
import { decryptWithPrivateKey, encryptWithPublicKey } from '../crypto/asymmetric'
import { Asymmetric } from '../crypto'


require('dotenv').config()

function customHashGenerate( sharedSecret: Buffer | Uint8Array,
  s1: Buffer,
  ephemKeyBuffer: Buffer ) {

  const counter1 = Buffer.from('00000001', 'hex')
  const counter2 = Buffer.from('00000002', 'hex')

  const hash = Asymmetric.hashMessage(
    'sha256',
    Buffer.concat(
      [sharedSecret, counter1, s1, ephemKeyBuffer],
      sharedSecret.length + s1.length + ephemKeyBuffer.length + counter1.length,
    ),
  )
  const hash2 = Asymmetric.hashMessage(
    'sha256',
    Buffer.concat(
      [sharedSecret, counter2, s1, ephemKeyBuffer],
      sharedSecret.length + s1.length + ephemKeyBuffer.length + counter2.length,
    ),
  )
  const cipherKey = hash
  const macKey = hash2.slice(0, hash2.length / 2)

  return {cipherKey, macKey}
}

function customMacGenerate( macKey?: Buffer, s2?: Buffer, cipherText?: Buffer ) {

  const mac = Asymmetric.macMessage(
    'sha256',
    macKey,
    Buffer.concat([cipherText, s2], cipherText.length + s2.length),
  )

  return mac.slice(0, mac.length / 2)
}

async function run() {
  const toEncrypt = 'messageToEncrypt'

  const publicWrappingKey = '0450863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b23522cd470243453a299fa9e77237716103abc11a1df38855ed6f2ee187e9c582ba6'
  const options: EciesOptions = {
    curveType: Asymmetric.EciesCurveType.Secp256k1,
    symmetricCypherType: 'aes-256-ctr',
    keyFormat: 'compressed',
    s1: 'ore1rngq1jyx',
  }   
  const encryptResult = encryptWithPublicKey(publicWrappingKey, toEncrypt, options, customHashGenerate, customMacGenerate)

  const {ephemPublicKey, ciphertext, mac} = encryptResult

  const payload = ephemPublicKey + ciphertext + mac

  console.log('encrypted payload:', payload)
  console.log('encrypted payload:', encryptResult)

  const decryptedPayload = await decryptWithPrivateKey(encryptResult, '18E14A7B6A307F426A94F8114701E7C8E774E7F9A47E2C2035DB29A206321725', options, customHashGenerate, customMacGenerate)
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