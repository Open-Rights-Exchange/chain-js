/* eslint-disable @typescript-eslint/indent */
import { AesEncryptedData, AesEncryptedDataStringBrand } from './aesCryptoModels'
import { AsymmetricEncryptedDataStringBrand } from './asymmetricModels'
import { Ed25519EncryptedData, Ed25519EncryptedDataStringBrand } from './ed25519CryptoModels'

/** Stringified JSON ciphertext (used for private keys) */
export type EncryptedDataString = string &
  (AesEncryptedDataStringBrand | AsymmetricEncryptedDataStringBrand | Ed25519EncryptedDataStringBrand)

/** Generic encypted data object */
export type EncryptedData = any

/** Stringified JSON ciphertext (used for private keys) */
export type SymmetricEncryptedDataString = string & (AesEncryptedDataStringBrand | Ed25519EncryptedDataStringBrand)

/** Generic encypted data object */
export type SymmetricEncryptedData = AesEncryptedData | Ed25519EncryptedData
