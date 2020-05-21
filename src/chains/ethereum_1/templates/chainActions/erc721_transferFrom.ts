// import { toHex } from 'web3-utils'
import {
  EthereumAddress,
  EthereumTransactionAction,
  EthereumDecomposeReturn,
  EthereumChainActionType,
} from '../../models'
import { erc721Abi } from '../abis/erc721Abi'

interface erc721TransferFromParams {
  contractAddress: EthereumAddress
  from: EthereumAddress
  transferFrom: EthereumAddress
  to: EthereumAddress
  tokenId: number
}

export const composeAction = ({ contractAddress, from, transferFrom, to, tokenId }: erc721TransferFromParams) => {
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

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, contract } = action
  if (to && from && contract && contract.abi === erc721Abi && contract.method === 'transferFrom') {
    return {
      chainActionType: EthereumChainActionType.Erc721TransferFrom,
      args: { ...action },
    }
  }

  return null
}
