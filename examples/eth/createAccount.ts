import { ChainFactory, ChainType } from '../../src/index'

import { ChainSettings, ChainEndpoint } from '../../src/models/generalModels'

// import { ChainEthereumV1 } from '../../src/chains/ethereum_1/ChainEthereumV1'

export const ropstenEndpoints: ChainEndpoint[] = [
  {
    url: new URL('https://ropsten.infura.io/v3/fc379c787fde4363b91a61a345e3620a'),
  },
]
;(async () => {
  try {
    const ropsten = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints, {} as ChainSettings)
    await ropsten.connect()
    console.log(await ropsten.chainInfo)
  } catch (error) {
    console.log(error)
  }
})()
