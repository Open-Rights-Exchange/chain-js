// import { toHex } from 'web3-utils'
import { EthereumTransactionAction } from '../../models'

export const action = (tokenTransferAction: EthereumTransactionAction) => {
  const { to, from, value, contract } = tokenTransferAction
  return {
    to,
    from,
    value,
    contract,
  }
}
