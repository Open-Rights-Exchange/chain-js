/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { ChainFactory, ChainType } from '../../../index'
import { ChainEndpoint } from '../../../models/generalModels'

require('dotenv').config()

export const { env } = process

export const ropstenEndpoints: ChainEndpoint[] = [
  {
    url: new URL('https://ropsten.infura.io/v3/fc379c787fde4363b91a61a345e3620a'),
  },
]
;(async () => {
  try {
    const ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints)
    await ropsten.connect()

    // crypto
    const encrypted = ropsten.encrypt('mystring', 'password', 'mysalt')
    console.log('encrypted text:', encrypted)
    const decrypted = ropsten.decrypt(encrypted, 'password', 'mysalt')
    console.log('decrypted text:', decrypted)
  } catch (error) {
    console.log(error)
  }
})()
