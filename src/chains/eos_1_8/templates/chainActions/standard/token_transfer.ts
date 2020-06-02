import { ChainActionType, ActionDecomposeReturn, TokenTransferParams } from '../../../../../models'
import {
  composeAction as erc20TokenTransferComposeAction,
  decomposeAction as erc20TokenTransferDecomposeAction,
} from '../chainSpecific/eosToken_transfer'

// Calls ERC20Transfer as default token template for Ethereum
export const composeAction = ({
  contractName,
  fromAccountName,
  toAccountName,
  amount,
  symbol,
  memo,
  permission,
}: TokenTransferParams) => ({
  ...erc20TokenTransferComposeAction({
    contractName,
    fromAccountName,
    toAccountName,
    amount: amount as number, // handle possible BN
    symbol,
    memo,
    permission,
  }),
})

export const decomposeAction = (action: any): ActionDecomposeReturn => {
  const decomposed = erc20TokenTransferDecomposeAction(action)
  if (decomposed) {
    return {
      ...decomposed,
      chainActionType: ChainActionType.TokenTransfer,
    }
  }
  return null
}
