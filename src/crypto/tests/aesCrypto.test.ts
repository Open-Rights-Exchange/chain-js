/* eslint-disable quotes */
import { encrypt, decrypt, deriveKey, decryptWithKey, AesEncryptionOptions } from '../aesCrypto'
import { timed } from './utils'
// import { rejects } from 'assert';

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
    salt = USER_ACCOUNT_ENCRYPTION_SALT
    privateKey = ORE_TESTA_ACCOUNT_KEY
    walletPassword = WALLET_PASSWORD
    encryptionOptions = {
      salt,
      iter,
    }
    encrypted = encrypt(privateKey, walletPassword, encryptionOptions)
    encrypted2 = encrypt(privateKey, walletPassword, { salt, iter: 1000 })
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

      describe('Iterations', () => {
        it('Does One Thousand iterations', async () => {
          const time = await timed(() => encrypt(privateKey, walletPassword, { salt, iter: 1000 }))()
          console.log(' One Thousand iterations', time.timeElapsed)
          expect(time).toBeTruthy()
        })

        it('Does Ten Thousand iterations', async () => {
          const time = await timed(() => encrypt(privateKey, walletPassword, { salt, iter: 10000 }))()
          console.log('Ten Thousand iterations', time.timeElapsed)
          expect(time).toBeTruthy()
        })

        it('Does Sixty Five Thousand iterations', async () => {
          const time = await timed(() => encrypt(privateKey, walletPassword, { salt, iter: 650000 }))()
          console.log('Sixty Five iterations', time.timeElapsed)
          expect(time).toBeTruthy()
        })

        it('Does One Hundred Thousand iterations', async () => {
          const time = await timed(() => encrypt(privateKey, walletPassword, { salt, iter: 100000 }))()
          console.log('One Hundred iterations', time.timeElapsed)
          expect(time).toBeTruthy()
        })

        it('Does Five Hundred Thousand iterations', async () => {
          const time = await timed(() => encrypt(privateKey, walletPassword, { salt, iter: 500000 }))()
          console.log('Five Hundred iterations', time.timeElapsed)
          expect(time).toBeTruthy()
        })

        it('Does One Million iterations', async () => {
          const time = await timed(() => encrypt(privateKey, walletPassword, { salt, iter: 1000000 }))()
          console.log('One Million iterations', time.timeElapsed)
          expect(time).toBeTruthy()
        })

        it('Does Five Million iterations', async () => {
          const time = await timed(() => encrypt(privateKey, walletPassword, { salt, iter: 5000000 }))()
          console.log('Five Million iterations', time.timeElapsed)
          expect(time).toBeTruthy()
        })
      })
    })

    describe('decrypt', () => {
      it('returns the original privateKey', () => {
        const decrypted = decrypt(encrypted, walletPassword, encryptionOptions)
        expect(decrypted.toString()).toMatch(privateKey)
      })
      it('does not throw with no (optional) iter', () => {
        const decrypted = decrypt(encrypted, walletPassword, { salt })
        expect(decrypted.toString()).toMatch(privateKey)
      })
      it('automatically infers iter value from encrypted value (iter:1000)', () => {
        const decrypted2 = decrypt(encrypted2, walletPassword, { salt })
        expect(decrypted2.toString()).toMatch(privateKey)
      })
    })
  })
})
