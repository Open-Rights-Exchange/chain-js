// import { toHex } from 'web3-utils'
import { EthereumAddress } from '../../models'
import { erc20Abi } from './data/erc20Abi'

interface erc20TransferFromParams {
  contractAddress: EthereumAddress
  from: EthereumAddress
  transferFrom: EthereumAddress
  to: EthereumAddress
  value: number
}

export const action = ({ contractAddress, from, transferFrom, to, value }: erc20TransferFromParams) => {
  const contract = {
    abi: erc20Abi,
    parameters: [transferFrom, to, value],
    method: 'transferFrom',
  }
  return {
    to: contractAddress,
    from,
    contract,
  }
}
