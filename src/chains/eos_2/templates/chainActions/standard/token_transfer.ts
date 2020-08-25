import { ChainActionType, ActionDecomposeReturn, TokenTransferParams } from '../../../../../models'
import {
  composeAction as eosTokenTransferComposeAction,
  decomposeAction as eosTokenTransferDecomposeAction,
} from '../chainSpecific/eosToken_transfer'
import { toEosAssetPaddedAmount } from '../../../helpers'

/** Calls EosTokenTransfer as default token template for Ethereum */
export const composeAction = ({
  contractName,
  fromAccountName,
  toAccountName,
  amount,
  symbol,
  memo,
  permission,
  precision,
}: TokenTransferParams) => ({
  ...eosTokenTransferComposeAction({
    contractName,
    fromAccountName,
    toAccountName,
    amount: toEosAssetPaddedAmount(amount, precision),
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
      // TODO EOS - should provide precision by reverse engineering eos asset string
      chainActionType: ChainActionType.TokenTransfer,
    }
  }
  return null
}
