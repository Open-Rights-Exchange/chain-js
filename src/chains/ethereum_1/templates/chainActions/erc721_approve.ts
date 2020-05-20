// import { toHex } from 'web3-utils'
import { EthereumAddress } from '../../models'
import { erc721Abi } from '../abis/erc721Abi'

interface erc721ApproveParams {
  contractAddress: EthereumAddress
  from: EthereumAddress
  to: EthereumAddress
  tokenId: number
}

export const composeAction = ({ contractAddress, from, to, tokenId }: erc721ApproveParams) => {
  const contract = {
    abi: erc721Abi,
    parameters: [to, tokenId],
    method: 'approve',
  }
  return {
    to: contractAddress,
    from,
    contract,
  }
}
