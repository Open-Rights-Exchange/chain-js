/* eslint-disable quotes */
import { encrypt, decrypt, deriveKey, decryptWithKey, AesEncryptionOptions, decryptWithPassword, encryptWithPassword } from '../aesCrypto'

// import { rejects } from 'assert';

describe('encryption/decryption of private keys with wallet passwords', () => {
  let privateKey: string
  let iter: number
  let salt: string
  let walletPassword: string
  let encrypted: string
  let encrypted2: string
  let encrypted3: string
  let password3: string
  let salt3: string
  let unencrypted3: string
  let encrypted4: string
  let password4: string
  let salt4: string
  let unencrypted4: string
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
    encrypted = encryptWithPassword(privateKey, walletPassword, encryptionOptions)
    encrypted2 = encryptWithPassword(privateKey, walletPassword, { salt, iter: 1000 })
    // encrypted3 = '{\"iv\":\"kEkPzKzE9yHakzAQD+M9QA==\",\"v\":1,\"iter\":10000,\"ks\":128,\"ts\":64,\"mode\":\"gcm\",\"adata\":\"\",\"cipher\":\"aes\",\"ct\":\"+vrpzdZvm4n7nrRCYtSvpB1QtMAM8DsrDM/5xR1ku8d45x6mbIgG6RAZ4HC34/A1+lGf0hjT1y2dGoc=\"}'
    encrypted3 =
      '{"iv":"lB1MzrgmfQWjoWJ7Tb1tHg==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"gcm","adata":"","cipher":"aes","ct":"JytujH75c56nJHJo"}'
    password3 = '5Jz8pun94xbr5ZXrTZbs9VgGieHPGyrGuYHa8xx6jUETPLeNhiY'
    salt3 = 'us62bn 2l0df5j'
    unencrypted3 = '2233'
    // 4
    // encrypted4 = '{\"iv\":\"bcZF619e5pTIieTA1gpTLg==\",\"v\":1,\"iter\":1000,\"ks\":128,\"ts\":64,\"mode\":\"gcm\",\"adata\":\"\",\"cipher\":\"aes\",\"ct\":\"sfsbvFYGhcT+aOAH\"}'
    // failing eth
    // encrypted4 = JSON.stringify({
    //   iv: 'bcZF619e5pTIieTA1gpTLg==',
    //   v: 1,
    //   iter: 1000,
    //   ks: 128,
    //   ts: 64,
    //   mode: 'gcm',
    //   adata: '',
    //   cipher: 'aes',
    //   ct: 'sfsbvFYGhcT+aOAH',
    // })
    // encrypted4 = JSON.stringify({
    //   iv: 'b3TivbV0lLZvq0vpRXeYFQ==',
    //   v: 1,
    //   iter: 10000,
    //   ks: 128,
    //   ts: 64,
    //   mode: 'gcm',
    //   adata: '',
    //   cipher: 'aes',
    //   ct: 'qFkEqQI4vAxDDuKc',
    // })
    encrypted4 = JSON.stringify({
      iv: 'l7/s5WCb134ZaYZA4xJWQQ==',
      v: 1,
      iter: 10000,
      ks: 128,
      ts: 64,
      mode: 'gcm',
      adata: '',
      cipher: 'aes',
      ct: '/SGpo50WiUAQ0hbo',
    })
    encrypted4 = JSON.stringify({
      iv: '0t6n4qqmI+Vjm7s5OzEACQ==',
      v: 1,
      iter: 1000000,
      ks: 128,
      ts: 64,
      mode: 'gcm',
      adata: '',
      cipher: 'aes',
      ct: 'FHxhrXc0CYZ1kb4h',
    })
    password4 = '5Jka7TQfp77QzgVYhXGbXuT21fKgdJiUgNHhMxneJNzZqsS4CXi'
    salt4 = 'us62bn 2l0df5j'
    unencrypted4 = '2233'
    // encrypted4 = JSON.stringify({
    //   iv: '5JlCOJ9egRz3dJnyj7O4lg==',
    //   v: 1,
    //   iter: 1000,
    //   ks: 128,
    //   ts: 64,
    //   mode: 'gcm',
    //   adata: '',
    //   cipher: 'aes',
    //   ct: 'JsAUSAoWV7QL7DQfF4XZ5UhhW+J83tlMhMCj5c75vU5jTBc2xRE2OU6F43eI6ueFDZ93FpJAOEL5TPQ=',
    // })

    //   encrypted = JSON.stringify({
    //     iv: '0lMiHLO9mqYkFF5Cb1LiGQ==',
    //     v: 1,
    //     iter: 1000000,
    //     ks: 128,
    //     ts: 64,
    //     mode: 'gcm',
    //     adata: '',
    //     cipher: 'aes',
    //     ct: '2YZJsOaTIXMDa1tMLzzkjyDd8EqUJTc+LRo+TAWoNMUJYpbOl7jXUg8OAswBWJe8t/9g8VQr++6F5pw=',
    //   })
    //   console.log('encrypted:', encrypted)
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
      // it('known string3 pw', () => {
      //   const decrypted3 = decryptWithPassword(encrypted3, password3, { salt: salt3 })
      //   expect(decrypted3.toString()).toMatch(unencrypted3)
      // })
      it('known string4 p4', () => {
        const decrypted4 = decryptWithPassword(encrypted4, password4, { salt: salt4 })
        console.log('decrypted4:', decrypted4)
        expect(decrypted4.toString()).toMatch(unencrypted4)
      })
    })
  })
})
