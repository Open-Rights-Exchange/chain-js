/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { ChainFactory, ChainType } from '../../../index'
import { ChainEndpoint } from '../../../models/generalModels'
import { toEthereumPrivateKey, toEthereumPublicKey, toEthereumSymbol } from '../helpers'
import { toChainEntityName } from '../../../helpers'
import { ropstenEndpoints } from './helpers/networks'

require('dotenv').config()

export const { env } = process
;(async () => {
  try {
    const ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints)
    await ropsten.connect()

    // crypto
    // const encrypted = ropsten.encrypt('mystring', 'password', 'mysalt')
    // console.log('encrypted text:', encrypted)
    // const decrypted = ropsten.decrypt(encrypted, 'password', 'mysalt')
    // console.log('decrypted text:', decrypted)

    // encrypt with public key / decrypt with private key
    // address: 0xefA688712c9635e264B18908c6DFD394782c2C24
    const publicKey = toEthereumPublicKey(
      '5103e43473c469878ce7cd435de7baf98095c0193ac71aaed93b27cd9c012ff7d999584df06fa9a09208150a51b6b78e269e091c22cfe59044d875b3a373e6e1',
    )
    const privateKey = toEthereumPrivateKey('0x7261573a28ebe63af0833d2666c3fbd0016f32db7137c5895fd390ee0e62ad40')
    const encrypted = await ropsten.encryptWithPublicKey('text to encrypt', publicKey)
    console.log('encrypted text:', encrypted)
    const decrypted = await ropsten.decryptWithPrivateKey(encrypted, privateKey)
    console.log('decrypted text:', decrypted)

    // get token balance
    console.log(
      'get Eth balance:',
      await ropsten.fetchBalance(
        toChainEntityName('0x69bC139aFf2C03Bff634D1e62431B288c1a55f2e'),
        toEthereumSymbol('eth'),
      ),
    )
    console.log(
      'get Dragon Vein Token Test token balance:',
      await ropsten.fetchBalance(
        toChainEntityName('0x279e964ab26796022e828e40daf9e42761e719a9'),
        toEthereumSymbol('DVT2'),
        '0x4a952387cae858ee7f0bc405a41647973ff04e74',
      ),
    )
    console.log(
      'get AutoQA token balance:',
      await ropsten.fetchBalance(
        toChainEntityName('0xb83339d874f27b7e74dc188bd6b2a51a1167946c'),
        toEthereumSymbol('AQA'),
        '0x9699f68bebf4b360d9a529523d7d6d23b6f52d44',
      ),
    )
  } catch (error) {
    console.log(error)
  }
})()
