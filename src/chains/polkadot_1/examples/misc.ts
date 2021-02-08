/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { ChainFactory, ChainType } from '../../../index'
import { PolkadotChainEndpoint } from '../models'

/* eslint-disable no-console */
require('dotenv').config()

export const { env } = process

export const serverEndpoints: PolkadotChainEndpoint[] = [
  {
    // url: 'https://rpc.polkadot.io',
    // options: {
    //   headers: {
    //     'Content-Type': 'application/json',
    //   }
    // }
    url: 'wss://rpc.polkadot.io'
  },
];

(async () => {
  try {
    const polka = new ChainFactory().create(ChainType.PolkadotV1, serverEndpoints)
    await polka.connect()
    // console.debug(polka.chainInfo)
  } catch (error) {
    console.log(error)
  }
})()
