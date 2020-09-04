import BN from 'bn.js'
import { EthUnit, EthereumTransactionAction, EthereumAddress } from '../../../models'
import { ethereumTrxArgIsNullOrEmpty, toWeiString } from '../../../helpers'
import { DEFAULT_ETH_SYMBOL } from '../../../ethConstants'
import { ChainActionType, ActionDecomposeReturn } from '../../../../../models'
import { toChainEntityName } from '../../../../../helpers'

export interface EthTransferParams {
  value: string
  from?: EthereumAddress
  to: EthereumAddress
}

/** Sends ETH (in units of Wei) */
export const composeAction = (params: EthTransferParams) => {
  const { from, to, value } = params
  const symbol = DEFAULT_ETH_SYMBOL
  const valueWei = toWeiString(value, symbol as EthUnit) // using 0 precision since the toWei already converts to right precision for EthUnit
  return {
    from,
    to,
    value: new BN(valueWei, 10), // must be a hex '0x' string or BN
  }
}

export const decomposeAction = (action: EthereumTransactionAction): ActionDecomposeReturn => {
  const { to, from, value, data, contract } = action
  if (to && value && !contract && ethereumTrxArgIsNullOrEmpty(data)) {
    const returnData: EthTransferParams = {
      // coerce to string as EthereumAddress could be Buffer type
      to: toChainEntityName(to as string),
      from: from ? toChainEntityName(from as string) : null,
      value: value as string,
    }
    const partial = !returnData?.from
    return {
      chainActionType: ChainActionType.ValueTransfer,
      args: returnData,
      partial,
    }
  }

  return null
}
