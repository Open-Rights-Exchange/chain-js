import { ActionDecomposeReturn, ChainActionType, TokenApproveParams } from '../../../../../models'
import {
  composeAction as eosTokenApproveComposeAction,
  decomposeAction as eosTokenApproveDecomposeAction,
} from '../chainSpecific/eosToken_approve'

/** Calls EosTokenApprove as default token template for Ethereum */
export const composeAction = ({
  fromAccountName,
  toAccountName,
  amount,
  contractName,
  symbol,
  permission,
}: TokenApproveParams) => ({
  ...eosTokenApproveComposeAction({
    contractName,
    fromAccountName,
    toAccountName,
    amount: amount as number, // handle possible BN
    symbol,
    permission,
  }),
})

export const decomposeAction = (action: any): ActionDecomposeReturn => {
  const decomposed = eosTokenApproveDecomposeAction(action)
  if (decomposed) {
    return {
      ...decomposed,
      chainActionType: ChainActionType.TokenApprove,
    }
  }
  return null
}
