import { ChainActionType, ActionDecomposeReturn, TokenTransferParams } from '../../../../../models'
import {
  composeAction as eosTokenTransferComposeAction,
  decomposeAction as eosTokenTransferDecomposeAction,
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
  ...eosTokenTransferComposeAction({
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
  const decomposed = eosTokenTransferDecomposeAction(action)
  if (decomposed) {
    return {
      ...decomposed,
      chainActionType: ChainActionType.TokenTransfer,
    }
  }
  return null
}
