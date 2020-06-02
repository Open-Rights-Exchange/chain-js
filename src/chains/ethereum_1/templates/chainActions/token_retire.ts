import { ChainActionType } from '../../../../models'
import { EthereumAddress, EthereumTransactionAction, EthereumDecomposeReturn } from '../../models'
import { composeAction as tokenBurnComposeAction, decomposeAction as tokenBurnDecomposeAction } from './erc20_burn'

interface TokenRetireParams {
  fromAccountName?: EthereumAddress
  amount?: number
  contractName?: EthereumAddress
}

// Calls ERC20Retire as default token template for Ethereum
export const composeAction = ({ fromAccountName, amount, contractName }: TokenRetireParams) => ({
  ...tokenBurnComposeAction({
    contractAddress: contractName,
    from: fromAccountName,
    value: amount,
  }),
})

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  if (tokenBurnDecomposeAction(action)) {
    return {
      ...tokenBurnDecomposeAction(action),
      chainActionType: ChainActionType.TokenRetire,
    }
  }
  return null
}
