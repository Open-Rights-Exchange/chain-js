import { ChainActionType } from '../../../../models'
import { EthereumAddress, EthereumTransactionAction, EthereumDecomposeReturn } from '../../models'
import { composeAction as erc20Burn } from './erc20_burn'
import { erc20Abi } from '../abis/erc20Abi'

interface tokenRetireParams {
  fromAccountName?: EthereumAddress
  tokenAmount?: number
  contractName?: EthereumAddress
}

// TODO: Call erc20 transfer compose action by default instead of recreating the values here
export const composeAction = ({ fromAccountName, tokenAmount, contractName }: tokenRetireParams) => ({
  ...erc20Burn({
    contractAddress: contractName,
    from: fromAccountName,
    value: tokenAmount,
  }),
})

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, contract } = action
  if (to && contract && contract.abi === erc20Abi && contract.method === 'burn') {
    const returnData: Partial<tokenRetireParams> = {
      contractName: to,
      fromAccountName: from,
      tokenAmount: contract.parameters[0] as number,
    }
    const partial = !returnData?.fromAccountName
    return {
      chainActionType: ChainActionType.TokenTransfer,
      args: returnData,
      partial,
    }
  }
  return null
}
