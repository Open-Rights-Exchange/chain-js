import { timed } from './utils'

import { encrypt, decrypt, calculatePasswordByteArray, passwordEncryptionDefaults } from '../ed25519Crypto'

declare let global: any

describe('encryption/decryption of private keys with wallet passwords', () => {
  let privateKey: string
  let salt: string
  let walletPassword: string
  let encrypted: string
  let encrypted2: string
  let encryptionOptions: any
  const messageToEncrypt: string = 'test'

  beforeAll(() => {
    salt = global.USER_ACCOUNT_ENCRYPTION_SALT
    privateKey = global.ORE_TESTA_ACCOUNT_KEY
    walletPassword = global.WALLET_PASSWORD
    encryptionOptions = {
      ...passwordEncryptionDefaults,
      salt,
    }
    const passwordKey = calculatePasswordByteArray(walletPassword, encryptionOptions)
    encrypted = encrypt(messageToEncrypt, passwordKey)
    const passwordKey2 = calculatePasswordByteArray(walletPassword, encryptionOptions)
    encrypted2 = encrypt(messageToEncrypt, passwordKey2)
  })

  describe('decryptWithKey', () => {
    it('returns the original private key', () => {
      const key = calculatePasswordByteArray(walletPassword, encryptionOptions)
      const decrypted = decrypt(encrypted, key)
      expect(decrypted).toMatch(messageToEncrypt)
    })

    it('does not return privateKey with a bad key', () => {
      const badPassword = 'BadPassword'
      const key = calculatePasswordByteArray(badPassword, encryptionOptions)
      expect(() => decrypt(encrypted, key)).toThrowError('Could not decrypt message')
    })

    describe('encrypt', () => {
      it('returns an encrypted string', () => {
        expect(encrypted).toEqual(expect.not.stringContaining(privateKey))
      })
      it('returns an encrypted string with different options', () => {
        expect(encrypted2).toEqual(expect.not.stringContaining(privateKey))
      })

      describe('Iterations', () => {
        it('One Thousand iterations', async () => {
          const passwordKey = calculatePasswordByteArray(walletPassword, { ...encryptionOptions, N: 1024 })
          const time = await timed(() => encrypt(messageToEncrypt, passwordKey))()
          console.log('One Thousand iterations', time.timeElapsed)
          expect(time).toBeTruthy()
        })

        it('Eight Thousand iterations', async () => {
          const passwordKey = calculatePasswordByteArray(walletPassword, { ...encryptionOptions, N: 8192 })
          const time = await timed(() => encrypt(messageToEncrypt, passwordKey))()
          console.log('Eight Thousand iterations', time.timeElapsed)
          expect(time).toBeTruthy()
        })

        it('Sixteen Thousand iterations', async () => {
          const passwordKey = calculatePasswordByteArray(walletPassword, encryptionOptions)
          const time = await timed(() => encrypt(messageToEncrypt, passwordKey))()
          console.log('Sixteen Thousand iterations', time.timeElapsed)
          expect(time).toBeTruthy()
        })

        it('Sixty Five Thousand iterations', async () => {
          const passwordKey = calculatePasswordByteArray(walletPassword, { ...encryptionOptions, N: 65536 })
          const time = await timed(() => encrypt(messageToEncrypt, passwordKey))()
          console.log('Sixty Five Thousand iterations', time.timeElapsed)
          expect(time).toBeTruthy()
        })

        it('One Hundred Thirty Thousand iterations', async () => {
          const passwordKey = calculatePasswordByteArray(walletPassword, { ...encryptionOptions, N: 131072 })
          const time = await timed(() => encrypt(messageToEncrypt, passwordKey))()
          console.log('One Hundred Thirty Thousand iterations', time.timeElapsed)
          expect(time).toBeTruthy()
        })

        it('Five Hundred Twenty Four Thousand iterations', async () => {
          const passwordKey = calculatePasswordByteArray(walletPassword, { ...encryptionOptions, N: 524288 })
          const time = await timed(() => encrypt(messageToEncrypt, passwordKey))()
          console.log('Five Hundred Twenty Four Thousand iterations', time.timeElapsed)
          expect(time).toBeTruthy()
        })

        it('One Million iterations', async () => {
          const passwordKey = calculatePasswordByteArray(walletPassword, { ...encryptionOptions, N: 1048576 })
          const time = await timed(() => encrypt(messageToEncrypt, passwordKey))()
          console.log('One Million iterations', time.timeElapsed)
          expect(time).toBeTruthy()
        })

        it('Two Million iterations', async () => {
          const passwordKey = calculatePasswordByteArray(walletPassword, { ...encryptionOptions, N: 2097152 })
          const time = await timed(() => encrypt(messageToEncrypt, passwordKey))()
          console.log('Two Million iterations', time.timeElapsed)
          expect(time).toBeTruthy()
        })
      })
    })

    describe('decrypt', () => {
      it('returns the original encrypted message', () => {
        const key = calculatePasswordByteArray(walletPassword, encryptionOptions)
        const decrypted = decrypt(encrypted, key)
        expect(decrypted.toString()).toMatch(messageToEncrypt)
      })
      it('does not throw with no (optional) iter', () => {
        const key = calculatePasswordByteArray(walletPassword, encryptionOptions)
        const decrypted = decrypt(encrypted, key)
        expect(decrypted.toString()).toMatch(messageToEncrypt)
      })
    })
  })
})
