// import { toHex } from 'web3-utils'
import { EthereumAddress, EthereumValue } from '../../models'

interface ethTransferParams {
  from: EthereumAddress
  to: EthereumAddress
  value: EthereumValue
}

export const action = ({ from, to, value }: ethTransferParams) => {
  return {
    from,
    to,
    value,
  }
}
