import { ChainActionType, TokenTransferFromParams, ActionDecomposeReturn } from '../../../../../models'
import {
  composeAction as eosTokenTransferFromComposeAction,
  decomposeAction as eosTokenTransferFromDecomposeAction,
} from '../chainSpecific/eosToken_transferFrom'

// Calls ERC20TransferFrom as default token template for Ethereum
export const composeAction = ({
  approvedAccountName,
  contractName,
  fromAccountName,
  toAccountName,
  amount,
  symbol,
  memo,
  permission,
}: TokenTransferFromParams) => ({
  ...eosTokenTransferFromComposeAction({
    contractName,
    approvedAccountName,
    fromAccountName,
    toAccountName,
    amount: amount as number,
    symbol,
    memo,
    permission,
  }),
})

export const decomposeAction = (action: any): ActionDecomposeReturn => {
  const decomposed = eosTokenTransferFromDecomposeAction(action)
  if (decomposed) {
    return {
      ...decomposed,
      chainActionType: ChainActionType.TokenTransferFrom,
    }
  }
  return null
}
