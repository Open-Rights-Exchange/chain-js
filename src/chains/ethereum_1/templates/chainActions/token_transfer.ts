// import { toHex } from 'web3-utils'
import { EthereumTransactionAction, EthereumChainActionType } from '../../models'

export const composeAction = (tokenTransferAction: EthereumTransactionAction) => {
  const { to, from, value, contract } = tokenTransferAction
  return {
    to,
    from,
    value,
    contract,
  }
}

export const decomposeAction = (action: any) => {
  const { to, from, value, contract } = action
  if (to && from && value && contract) {
    return {
      actionType: EthereumChainActionType.TokenTransfer,
      args: { ...action },
    }
  }

  return null
}
