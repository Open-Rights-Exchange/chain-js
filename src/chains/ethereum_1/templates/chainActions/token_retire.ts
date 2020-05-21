import { ChainActionType } from '../../../../models'
import { EthereumAddress, EthereumTransactionAction, EthereumDecomposeReturn } from '../../models'
import { composeAction as erc20Burn } from './erc20_burn'

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
  if (to && from && contract && contract.method === 'burn') {
    return {
      chainActionType: ChainActionType.TokenTransfer,
      args: { ...action },
    }
  }
  return null
}
