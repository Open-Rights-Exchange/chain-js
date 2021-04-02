import crypto from 'crypto'
import { SymmetricCypherType, Unencrypted } from '../asymmetricModels'

/**  uses KDF to derive a symmetric encryption from message */
export function generateMessageHash(cypherName: SymmetricCypherType, message: Unencrypted) {
  return crypto
    .createHash(cypherName)
    .update(message)
    .digest()
}

/**  computes the tag of encrypted message provided */
export function generateMessageMac(cypherName: SymmetricCypherType, key: crypto.CipherKey, message: Unencrypted) {
  return crypto
    .createHmac(cypherName, key)
    .update(message)
    .digest()
}
