// import { toHex } from 'web3-utils'
import { EthereumActionInput } from '../../models'

export const action = (tokenTransferAction: EthereumActionInput) => {
  const { to, value, contract } = tokenTransferAction
  return {
    to,
    value,
    contract,
  }
}
