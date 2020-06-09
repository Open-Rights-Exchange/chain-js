import { ChainFactory, ChainType } from '../../../index'
import { ChainEndpoint } from '../../../models'

require('dotenv').config()

export const algoTestnetEndpoints: ChainEndpoint[] = [
  {
    url: new URL('https://testnet-algorand.api.purestake.io/ps1'),
    settings: {
      token: {
        'X-API-Key': '7n0G2itKl885HQQzEfwtn4SSE1b6X3nb6zVnUw99',
      },
    },
  },
]
;(async () => {
  // Create an Algo chain instance and call a few functions
  const algoTest = new ChainFactory().create(ChainType.AlgorandV1, algoTestnetEndpoints)
  await algoTest.connect()
})()
