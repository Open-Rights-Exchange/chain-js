// import { toHex } from 'web3-utils'
import { EthereumAddress } from '../../models'
import { erc20Abi } from './data/erc20Abi'

interface erc20TransferParams {
  contractAddress: EthereumAddress
  from: EthereumAddress
  to: EthereumAddress
  value: number
}

export const action = ({ contractAddress, from, to, value }: erc20TransferParams) => {
  const contract = {
    abi: erc20Abi,
    parameters: [to, value],
    method: 'transfer',
  }
  return {
    to: contractAddress,
    from,
    contract,
  }
}
