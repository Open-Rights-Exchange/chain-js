//import { ChainEosV2 } from './chains/eos_2/ChainEosV2'
//import { ChainEthereumV1 } from './chains/ethereum_1/ChainEthereumV1'
//import { ChainAlgorandV1 } from './chains/algorand_1/ChainAlgorandV1'
import { Chain } from './interfaces'
import { ChainType, ChainEndpoint } from './models'
import { throwNewError } from './errors'
/**
 * Returns an instance of one of the concrete chain classes
 */
export class ChainFactory{
  //plugins: {new(): Chain;}[], 
  public create = (chainType: ChainType, endpoints: ChainEndpoint[], settings?: any): Chain => {

    switch (chainType) {
      case ChainType.EosV2:
        //return new ChainEosV2(endpoints, settings)
        throwNewError(`Chain type ${chainType} must be used via plugin`)
      case ChainType.EthereumV1:
        //return new ChainEthereumV1(endpoints, settings)
        throwNewError(`Chain type ${chainType} must be used via plugin`)
      case ChainType.AlgorandV1:
        //return new ChainAlgorandV1(endpoints, settings)
        throwNewError(`Chain type ${chainType} must be used via plugin`)
      default:
        throwNewError(`Chain type ${chainType} is not supported`)
    }
    return null
  }
  
}

// Can't currently add the constructor signature to Chain interface becasue each plugin is currently different
// new(endpoints: ChainEndpoint[], settings?: any): Chain;
// Define the high level plugin interface here again to work around this. 
type Plugin = {
  new(endpoints: ChainEndpoint[], settings?: any): Chain;
  chainType: string;
}

export function PluginChainFactory(
  plugins: Plugin[],
  chainType: ChainType,
  endpoints: ChainEndpoint[],
  settings?: any  
) : Chain
{
  var chain : Chain= null; 
  plugins.forEach(plugin => {   

    if(plugin.chainType.includes(chainType)) {
      chain = new plugin(endpoints, settings)
    }
  });
  if(chain==null) {
    throwNewError(`Chain type ${chainType} is not supported`)
  }
  
  return chain;
}