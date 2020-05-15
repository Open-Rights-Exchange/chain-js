// import { toHex } from 'web3-utils'
import { EthereumAddress } from '../../models'
import { erc20Abi } from './data/erc20Abi'

interface erc20IssueParams {
  contractAddress: EthereumAddress
  from: EthereumAddress
  value: number
}

export const action = ({ contractAddress, from, value }: erc20IssueParams) => {
  const contract = {
    abi: erc20Abi,
    parameters: [value],
    method: 'issue',
  }
  return {
    to: contractAddress,
    from,
    contract,
  }
}
