import * as algosdk from 'algosdk'
import { isNullOrEmpty, byteArrayToHexString } from '../../../../../helpers'
import { ActionDecomposeReturn, ChainActionType } from '../../../../../models'
import { AlgorandTransactionAction, AlgorandUnit, AlgorandValueTransferParams } from '../../../models'
import { toMicroAlgo, toAddressFromPublicKey, toAlgorandPublicKey } from '../../../helpers'
import { DEFAULT_ALGO_SYMBOL } from '../../../algoConstants'

export const composeAction = (args: AlgorandValueTransferParams): any => {
  const {
    fromAccountName: from,
    toAccountName: to,
    fee,
    amount: inputAmount,
    symbol = DEFAULT_ALGO_SYMBOL,
    memo,
    closeRemainderTo: closingAccount,
    firstRound,
    lastRound,
    genesisHash,
    genesisID,
  } = args
  const amount = toMicroAlgo(inputAmount, symbol as AlgorandUnit)
  const note = algosdk.encodeObj(memo)
  const closeRemainderTo = isNullOrEmpty(closingAccount) ? undefined : closingAccount
  const composedAction = algosdk.makePaymentTxn(
    from,
    to,
    fee,
    amount,
    closeRemainderTo,
    firstRound,
    lastRound,
    note,
    genesisHash,
    genesisID,
  )
  return {
    ...composedAction,
    from: toAddressFromPublicKey(toAlgorandPublicKey(byteArrayToHexString(composedAction.from.publicKey))),
    to: toAddressFromPublicKey(toAlgorandPublicKey(byteArrayToHexString(composedAction.to.publicKey))),
    closeRemainderTo: isNullOrEmpty(closingAccount)
      ? undefined
      : toAddressFromPublicKey(toAlgorandPublicKey(byteArrayToHexString(composedAction.closeRemainderTo.publicKey))),
  }
}

export const decomposeAction = (action: AlgorandTransactionAction): ActionDecomposeReturn => {
  const { amount, from, name, note, tag, to, type } = action
  const returnData = {
    toAccountName: to,
    fromAccountName: from,
    amount,
    symbol: AlgorandUnit.Microalgo,
    memo: algosdk.decodeObj(note),
    type,
    name,
    tag,
  }
  return {
    chainActionType: ChainActionType.ValueTransfer,
    args: returnData,
  }
}
