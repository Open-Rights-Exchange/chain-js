// import { toHex } from 'web3-utils'
import { EthereumAddress } from '../../models'
import { erc721Abi } from '../abis/erc721Abi'

interface erc721TransferFromParams {
  contractAddress: EthereumAddress
  from: EthereumAddress
  transferFrom: EthereumAddress
  to: EthereumAddress
  tokenId: number
}

export const action = ({ contractAddress, from, transferFrom, to, tokenId }: erc721TransferFromParams) => {
  const contract = {
    abi: erc721Abi,
    parameters: [transferFrom, to, tokenId],
    method: 'transferFrom',
  }
  return {
    to: contractAddress,
    from,
    contract,
  }
}
