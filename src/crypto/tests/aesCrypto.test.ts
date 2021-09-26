/* eslint-disable quotes */
/* eslint-disable no-console */
import { deriveKey, decryptWithKey, decryptWithPassword, encryptWithPassword } from '../aesCrypto'
import { AesEncryptionOptions } from '../aesCryptoModels'
import { timed } from './utils'

declare let global: any

describe('encryption/decryption of private keys with wallet passwords', () => {
  let privateKey: string
  let iter: number
  let salt: string
  let walletPassword: string
  let encrypted: string
  let encrypted2: string
  let encryptionOptions: AesEncryptionOptions

  beforeAll(() => {
    iter = 1000000
    salt = global.USER_ACCOUNT_ENCRYPTION_SALT
    privateKey = global.ORE_TESTA_ACCOUNT_KEY
    walletPassword = global.WALLET_PASSWORD
    encryptionOptions = {
      salt,
      iter,
    }
    encrypted = encryptWithPassword(privateKey, walletPassword, encryptionOptions)
    encrypted2 = encryptWithPassword(privateKey, walletPassword, { salt, iter: 1000 })
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
      const decrypted = decryptWithKey(encrypted, key)
      expect(decrypted).toMatch(privateKey)
    })

    it('does not return privateKey with a bad key', () => {
      const badPassword = 'BadPassword'
      const key = deriveKey(badPassword, iter, salt)
      expect(() => decryptWithKey(encrypted, key)).toThrow(
        expect.objectContaining({ message: "gcm: tag doesn't match" }),
      )
    })

    describe('encrypt', () => {
      it('returns an encrypted string', () => {
        expect(encrypted).toEqual(expect.not.stringContaining(privateKey))
      })
      it('returns an encrypted string with different options', () => {
        expect(encrypted2).toEqual(expect.not.stringContaining(privateKey))
      })

      describe('Encrypt Iterations', () => {
        it('Ten Thousand iterations', async () => {
          const time = await timed(() => encryptWithPassword(privateKey, walletPassword, { salt, iter: 10000 }))()
          console.log('Ten Thousand iterations', time.timeElapsed)
          expect(time).toBeTruthy()
        })
      })
    })

    describe('decrypt', () => {
      it('returns the original privateKey', () => {
        const decrypted = decryptWithPassword(encrypted, walletPassword, encryptionOptions)
        expect(decrypted.toString()).toMatch(privateKey)
      })
      it('does not throw with no (optional) iter', () => {
        const decrypted = decryptWithPassword(encrypted, walletPassword, { salt })
        expect(decrypted.toString()).toMatch(privateKey)
      })
      it('automatically infers iter value from encrypted value (iter:1000)', () => {
        const decrypted2 = decryptWithPassword(encrypted2, walletPassword, { salt })
        expect(decrypted2.toString()).toMatch(privateKey)
      })
    })
  })
})
