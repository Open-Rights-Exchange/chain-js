/* eslint-disable @typescript-eslint/indent */
import { AesEncryptedDataStringBrand } from './aesCryptoModels'
import { AsymEncryptedDataStringBrand } from './asymmetricModels'
import { Ed25519EncryptedDataStringBrand } from './ed25519CryptoModels'

/** Stringified JSON ciphertext (used for private keys) */
export type EncryptedDataString = string &
  (AesEncryptedDataStringBrand | AsymEncryptedDataStringBrand | Ed25519EncryptedDataStringBrand)
