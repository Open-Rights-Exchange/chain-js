// import { toHex } from 'web3-utils'
import { EthereumAddress } from '../../models'
import { erc20Abi } from './data/erc20Abi'

interface erc20ApproveParams {
  contractAddress: EthereumAddress
  from: EthereumAddress
  spender: EthereumAddress
  value: number
}

export const action = ({ contractAddress, from, spender, value }: erc20ApproveParams) => {
  const contract = {
    abi: erc20Abi,
    parameters: [spender, value],
    method: 'approve',
  }
  return {
    to: contractAddress,
    from,
    contract,
  }
}
