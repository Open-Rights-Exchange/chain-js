import BN from 'bn.js'
import { EthereumTransactionAction, EthereumAddress } from '../../../models'
import { ethereumTrxArgIsNullOrEmpty } from '../../../helpers'
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
  return {
    from,
    to,
    value: new BN(value, 10), // must be a hex '0x' string or BN
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
