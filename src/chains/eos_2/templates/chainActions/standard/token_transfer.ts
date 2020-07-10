import { ChainActionType, ActionDecomposeReturn, TokenTransferParams } from '../../../../../models'
import {
  composeAction as eosTokenTransferComposeAction,
  decomposeAction as eosTokenTransferDecomposeAction,
} from '../chainSpecific/eosToken_transfer'

/** Calls EosTokenTransfer as default token template for Ethereum */
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
    amount,
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
