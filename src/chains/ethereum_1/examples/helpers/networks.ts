import { ChainEthereumV1, ChainFactory, ChainType } from '../../../..'
import { TxExecutionPriority } from '../../../../models'
import { EthereumChainEndpoint, EthereumChainSettings } from '../../models'
// goerli
export const goerliEndpoints: EthereumChainEndpoint[] = [
  {
    url: 'https://goerli.infura.io/v3/fc379c787fde4363b91a61a345e3620a',
  },
]
export const goerliChainOptions: EthereumChainSettings = {
  chainForkType: {
    chainName: 'goerli',
    hardFork: 'istanbul',
  },
  defaultTransactionSettings: {
    maxFeeIncreasePercentage: 20,
    executionPriority: TxExecutionPriority.Fast,
  },
}
// ropsten
export const ropstenEndpoints: EthereumChainEndpoint[] = [
  {
    url: 'https://ropsten.infura.io/v3/fc379c787fde4363b91a61a345e3620a',
  },
]
export const ropstenChainOptions: EthereumChainSettings = {
  chainForkType: {
    chainName: 'ropsten',
    hardFork: 'istanbul',
  },
  defaultTransactionSettings: {
    maxFeeIncreasePercentage: 20,
    executionPriority: TxExecutionPriority.Fast,
  },
}

export async function connectChain(endpoints: EthereumChainEndpoint[], chainOptions: EthereumChainSettings) {
  const chain = new ChainFactory().create(ChainType.EthereumV1, endpoints, chainOptions) as ChainEthereumV1
  await chain.connect()
  return chain
}
