// import { toHex } from 'web3-utils'
import { EthereumTransactionAction, EthereumChainActionType, EthereumDecomposeReturn } from '../../models'

export const composeAction = (tokenTransferAction: EthereumTransactionAction): EthereumTransactionAction => {
  const { to, from, value, contract } = tokenTransferAction
  return {
    to,
    from,
    value,
    contract,
  }
}

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, value, contract } = action
  if (to && from && value && contract) {
    return {
      chainActionType: EthereumChainActionType.TokenTransfer,
      args: { ...action },
    }
  }

  return null
}
