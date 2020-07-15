import * as algosdk from 'algosdk'
import { ValueTransferParams, ActionDecomposeReturn, ChainActionType } from '../../../../../models'
import { AlgorandTransactionAction, AlgorandUnit } from '../../../models'
import { toMicroAlgo } from '../../../helpers'
import { DEFAULT_ALGO_SYMBOL } from '../../../algoConstants'

export const composeAction = ({
  fromAccountName,
  toAccountName,
  amount,
  symbol = DEFAULT_ALGO_SYMBOL,
  memo,
}: ValueTransferParams) => ({
  from: fromAccountName,
  to: toAccountName,
  amount: toMicroAlgo(amount, symbol as AlgorandUnit),
  note: algosdk.encodeObj(memo),
})

export const decomposeAction = (action: AlgorandTransactionAction): ActionDecomposeReturn => {
  const { to, from, amount, note } = action
  const returnData = {
    toAccountName: to,
    fromAccountName: from,
    amount,
    symbol: AlgorandUnit.Microalgo,
    memo: algosdk.decodeObj(note),
  }
  return {
    chainActionType: ChainActionType.ValueTransfer,
    args: returnData,
  }
}
