import { EosChainV18 } from './chains/eos_1_8/eosChainV18'
import { EthereumChainV1 } from './chains/ethereum_1/ethereumChainV1'
import { Chain, ChainType, ChainEndpoint, ChainSettings } from './models'
import { throwNewError } from './errors'

/**
 * Returns an instance of one of the concrete chain classes
 */
export class ChainFactory {
  public create = (chainType: ChainType, endpoints: ChainEndpoint[], settings: ChainSettings): Chain => {
    switch (chainType) {
      case ChainType.EosV18:
        return new EosChainV18(endpoints, settings)
      case ChainType.EthereumV1:
        return new EthereumChainV1(endpoints, settings)
      default:
        throwNewError(`Chain type ${chainType} is not supported`)
    }
    return null
  }
}
