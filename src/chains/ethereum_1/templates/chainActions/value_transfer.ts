import { BN } from 'ethereumjs-util'
import { EthereumAddress, EthUnit, EthereumTransactionAction, EthereumDecomposeReturn } from '../../models'
import { toWei, ethereumTrxArgIsNullOrEmpty } from '../../helpers'
import { DEFAULT_ETH_SYMBOL } from '../../ethConstants'
import { ChainActionType } from '../../../../models'

interface valueTransferParams {
  fromAccountName?: EthereumAddress
  toAccountName: EthereumAddress
  tokenAmount: number | BN
  tokenSymbol?: EthUnit
}

export const composeAction = ({
  fromAccountName,
  toAccountName,
  tokenAmount,
  tokenSymbol = DEFAULT_ETH_SYMBOL,
}: valueTransferParams) => ({
  from: fromAccountName,
  to: toAccountName,
  value: toWei(tokenAmount, tokenSymbol),
})

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, value, data, contract } = action
  if (to && value && !contract && ethereumTrxArgIsNullOrEmpty(data)) {
    const returnData: Partial<valueTransferParams> = {
      toAccountName: to,
      fromAccountName: from,
      tokenAmount: value as BN,
      tokenSymbol: EthUnit.Wei,
    }
    const partial = !returnData?.fromAccountName
    return {
      chainActionType: ChainActionType.ValueTransfer,
      args: returnData,
      partial,
    }
  }

  return null
}
