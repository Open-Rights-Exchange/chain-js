// import { toHex } from 'web3-utils'
import {
  EthereumAddress,
  EthereumTransactionAction,
  EthereumDecomposeReturn,
  EthereumChainActionType,
} from '../../models'
import { erc721Abi } from '../abis/erc721Abi'

interface erc721TransferParams {
  contractAddress: EthereumAddress
  from: EthereumAddress
  to: EthereumAddress
  tokenId: number
}

export const composeAction = ({ contractAddress, from, to, tokenId }: erc721TransferParams) => {
  const contract = {
    abi: erc721Abi,
    parameters: [to, tokenId],
    method: 'transfer',
  }
  return {
    to: contractAddress,
    from,
    contract,
  }
}

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, contract } = action
  if (to && from && contract && contract.method === 'transfer') {
    return {
      chainActionType: EthereumChainActionType.Erc721Transfer,
      args: { ...action },
    }
  }

  return null
}
