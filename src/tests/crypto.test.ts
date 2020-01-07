import { encrypt, decrypt, deriveKey, decryptWithKey } from '../crypto'

describe('encryption/decryption of private keys with wallet passwords', () => {
  let privateKey: string
  let salt: string
  let walletPassword: string
  let encrypted: string

  beforeAll(() => {
    privateKey = ORE_TESTA_ACCOUNT_KEY
    salt = USER_ACCOUNT_ENCRYPTION_SALT
    walletPassword = WALLET_PASSWORD
    encrypted = encrypt(privateKey, walletPassword, salt)
  })

  describe('deriveKey', () => {
    it('returns a deterministic salt', () => {
      expect(deriveKey(walletPassword, salt)).toEqual(deriveKey(walletPassword, salt))
      expect(deriveKey(walletPassword, salt)).not.toEqual(deriveKey(walletPassword, ''))
    })
  })

  describe('decryptWithKey', () => {
    it('returns the original private key', () => {
      const key = deriveKey(walletPassword, salt)
      const decrypted = decryptWithKey(encrypted, key)
      expect(decrypted.toString()).toMatch(privateKey)
    })

    // it('does not return privateKey with a bad key', () => {
    //   // const badPassword = 'BadPassword'
    //   const key = deriveKey(walletPassword, salt)
    //   expect(decryptWithKey(encrypted, key)).toThrow(expect.objectContaining({ message: 'gcm: tag doesn' }))
    // })
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

    // it('does not return privateKey with a bad password', () => {
    //   const badPassword = 'BadPassword'
    //   const decrypted = decrypt(encrypted, badPassword, salt)
    //   expect(decrypted.toString()).not.toMatch(privateKey)
    // })

    // it('does not return privateKey with a bad salt', () => {
    //   // const badPassword = 'BadPassword'
    //   const decrypted = decrypt(encrypted, walletPassword, '')
    //   expect(decrypted.toString()).not.toMatch(privateKey)
    // })
  })
})
