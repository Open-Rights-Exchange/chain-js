// import { toHex } from 'web3-utils'
import { EthereumAddress, EthereumValue } from '../../models'
import { erc20Abi } from './data/erc20Abi'

interface erc20TransferParams {
  contractAddress: EthereumAddress
  from: EthereumAddress
  to: EthereumAddress
  value: number
  data: EthereumValue[]
}

export const action = ({ contractAddress, from, to, value, data }: erc20TransferParams) => {
  const contract = {
    abi: erc20Abi,
    parameters: [to, value, data],
    method: 'transferAndCall',
  }
  return {
    to: contractAddress,
    from,
    contract,
  }
}
