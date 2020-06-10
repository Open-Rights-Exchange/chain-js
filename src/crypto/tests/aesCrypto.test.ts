/* eslint-disable quotes */
import { encrypt, decrypt, deriveKey, decryptWithKey } from '../aesCrypto'

// import { rejects } from 'assert';

describe('encryption/decryption of private keys with wallet passwords', () => {
  let privateKey: string
  let salt: string
  const iter: number = 1000000
  let walletPassword: string
  let encrypted: string

  beforeAll(() => {
    privateKey = ORE_TESTA_ACCOUNT_KEY
    salt = USER_ACCOUNT_ENCRYPTION_SALT
    walletPassword = WALLET_PASSWORD
    encrypted = encrypt(privateKey, walletPassword, salt, iter)
  })

  describe('deriveKey', () => {
    it('returns a deterministic salt', () => {
      expect(deriveKey(walletPassword, iter, salt)).toEqual(deriveKey(walletPassword, iter, salt))
      // expect(deriveKey(walletPassword, iter, salt)).not.toEqual(deriveKey(walletPassword, iter, ''))
    })
  })

  describe('decryptWithKey', () => {
    it('returns the original private key', () => {
      const key = deriveKey(walletPassword, iter, salt)
      const decrypted = decryptWithKey(encrypted, { iter, salt }, key)
      expect(decrypted).toMatch(privateKey)
    })

    it('does not return privateKey with a bad key', () => {
      const badPassword = 'BadPassword'
      const key = deriveKey(badPassword, iter, salt)
      expect(() => decryptWithKey(encrypted, { iter, salt }, key)).toThrow(
        expect.objectContaining({ message: "gcm: tag doesn't match" }),
      )
    })

    describe('encrypt', () => {
      it('returns an encrypted string', () => {
        expect(encrypted).toEqual(expect.not.stringContaining(privateKey))
      })
    })

    describe('decrypt', () => {
      it('returns the original privateKey', () => {
        const decrypted = decrypt(encrypted, walletPassword, salt)
        expect(decrypted.toString()).toMatch(privateKey)
      })
      it('does not throw with no (optional) salt and iter', () => {
        const decrypted = decrypt(encrypted, walletPassword)
        expect(decrypted.toString()).toMatch(privateKey)
      })
    })
  })
})
