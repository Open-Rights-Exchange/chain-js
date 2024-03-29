import crypto, { ECDHKeyFormat } from 'crypto'
import ed2Curve from 'ed2curve'
import nacl from 'tweetnacl'
import pkg from 'tweetnacl-util'
import { throwNewError } from '../errors'
import { EciesCurveType } from './asymmetricModels'

// tweetnacl-util is a commonjs module so need to be imported this way for named imports to work
const { encodeBase64 } = pkg

function assertPublicKeyBufferLengthValid(publicKey: Buffer, functionName: string) {
  if (!(publicKey.length === 65 || publicKey.length === 33)) {
    throwNewError(`${functionName}: publicKey buffer must be 65 bytes (uncompressed) or 33 bytes (compressed)`)
  }
}

/** Generates Ephemeral Keypair and sharedSecret - used for ECC curves and some others supported by Node crypto curveType */
export function generateEphemPublicKeyAndSharedSecretType1(
  publicKey: NodeJS.ArrayBufferView,
  curveType: EciesCurveType,
  keyFormat: ECDHKeyFormat,
) {
  assertPublicKeyBufferLengthValid(publicKey as Buffer, 'generateEphemPublicKeyAndSharedSecretType1')
  const ecdh = crypto.createECDH(curveType)
  const encodedEphemPublicKey = ecdh.generateKeys(null, keyFormat)
  const sharedSecret = ecdh.computeSecret(publicKey)
  return { ephemPublicKey: encodedEphemPublicKey, sharedSecret }
}

/** Generates sharedSecret using ephemPublicKey */
export function generateSharedSecretType1(
  publicKey: NodeJS.ArrayBufferView,
  secretKey: NodeJS.ArrayBufferView,
  curveType: EciesCurveType,
) {
  assertPublicKeyBufferLengthValid(publicKey as Buffer, 'generateSharedSecretType1')
  const ecdh = crypto.createECDH(curveType)
  ecdh.setPrivateKey(secretKey)
  const sharedSecret = ecdh.computeSecret(publicKey)
  return sharedSecret
}

/** Generated Ephemeral PublicKey and SharedSecret
 * The ed25519PublicKey parameter must be 32 byte encoded as a Uint8Array */
export function generateEphemPublicKeyAndSharedSecretEd25519(ed25519PublicKey: Uint8Array) {
  const { publicKey: ephemPublicKey, secretKey } = nacl.box.keyPair()
  const encodedEphemPublicKey = encodeBase64(ephemPublicKey)
  // **IMPORTANT**: algosdk only uses nacl module for generating signature
  // Thus it uses nacl.sign.keyPair() to generate ed25519 pk/sk
  // ed25519 keys are only for signature operation.
  // To use it with DiffieHellman encryption we need to convert keypair to curve25519
  // Then we can use converted key to generate secret via nacl.box
  // https://stackoverflow.com/questions/26954215/how-to-use-ed25519-to-encrypt-decrypt-data
  const curve25519PublicKey = ed2Curve.convertPublicKey(ed25519PublicKey)
  const sharedSecret = nacl.box.before(curve25519PublicKey, secretKey)
  return { ephemPublicKey: encodedEphemPublicKey, sharedSecret }
}

/** Generates sharedSecret using ephemeral PublicKey and ed25519 SecretKey
 * The ed25519PublicKey parameter must be 32 byte encoded as a Uint8Array */
export function generateSharedSecretEd25519(ephemPublicKey: Uint8Array, ed25519SecretKey: Uint8Array) {
  const curve25519SecretKey = ed2Curve.convertSecretKey(ed25519SecretKey)
  // Check IMPORTANT comment in generateEphemPublicKeyAndSharedSecret()
  const sharedSecret = nacl.box.before(ephemPublicKey, curve25519SecretKey)
  return sharedSecret
}
