import { ChainEosV2 } from './chains/eos_2/ChainEosV2'
import { ChainEthereumV1 } from './chains/ethereum_1/ChainEthereumV1'
import { ChainAlgorandV1 } from './chains/algorand_1/ChainAlgorandV1'
import { Chain } from './interfaces'
import { ChainType, ChainEndpoint } from './models'
import { throwNewError } from './errors'
/**
 * Returns an instance of one of the concrete chain classes
 */
export class ChainFactory {
  public create = (chainType: ChainType, endpoints: ChainEndpoint[], settings?: any): Chain => {
    switch (chainType) {
      case ChainType.EosV2:
        return new ChainEosV2(endpoints, settings)
      case ChainType.EthereumV1:
        return new ChainEthereumV1(endpoints, settings)
      case ChainType.AlgorandV1:
        return new ChainAlgorandV1(endpoints, settings)
      default:
        throwNewError(`Chain type ${chainType} is not supported`)
    }
    return null
  }
}
