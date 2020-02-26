import { ChainEosV18 } from './chains/eos_1_8/ChainEosV18'
import { ChainEthereumV1 } from './chains/ethereum_1/ChainEthereumV1'
import { Chain } from './interfaces'
import { ChainType, ChainEndpoint, ChainSettings } from './models'
import { throwNewError } from './errors'

/**
 * Returns an instance of one of the concrete chain classes
 */
export class ChainFactory {
  public create = (chainType: ChainType, endpoints: ChainEndpoint[], settings: ChainSettings): Chain => {
    switch (chainType) {
      case ChainType.EosV18:
        return new ChainEosV18(endpoints, settings)
      case ChainType.EthereumV1:
        return new ChainEthereumV1(endpoints, settings)
      default:
        throwNewError(`Chain type ${chainType} is not supported`)
    }
    return null
  }
}
