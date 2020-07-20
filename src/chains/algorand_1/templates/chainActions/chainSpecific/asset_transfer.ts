import * as algosdk from 'algosdk'
import { toAddressFromPublicKey, toAlgorandPublicKey } from '../../../helpers'
import { AlgorandDecomposeReturn, AlgorandAssetTransferParams, AlgorandChainActionType } from '../../../models'
import { isNullOrEmpty, byteArrayToHexString } from '../../../../../helpers'

/**
 * Composes asset transfer action
 * Special case: to begin accepting assets, set amount=0 and fromAccountName=toAccountName */
export const composeAction = (args: AlgorandAssetTransferParams) => {
  const {
    fromAccountName: from,
    toAccountName: to,
    amount,
    memo,
    fee,
    assetIndex,
    revocationTarget,
    closeRemainderTo: closingAccount,
    firstRound,
    lastRound,
    genesisHash,
    genesisID,
  } = args

  const note = algosdk.encodeObj(memo)
  const closeRemainderTo = isNullOrEmpty(closingAccount) ? undefined : closingAccount
  const composedAction = algosdk.makeAssetTransferTxn(
    from,
    to,
    closeRemainderTo,
    revocationTarget,
    fee,
    amount,
    firstRound,
    lastRound,
    note,
    genesisHash,
    genesisID,
    assetIndex,
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

/**
 * Decomposes asset transfer action */
export const decomposeAction = (action: any): AlgorandDecomposeReturn => {
  const { amount, from, name, note, tag, to, type, assetIndex } = action
  const returnData = {
    toAccountName: to,
    fromAccountName: from,
    amount,
    assetIndex,
    memo: algosdk.decodeObj(note),
    type,
    name,
    tag,
  }
  return {
    chainActionType: AlgorandChainActionType.AssetTransfer,
    args: returnData,
  }
}
