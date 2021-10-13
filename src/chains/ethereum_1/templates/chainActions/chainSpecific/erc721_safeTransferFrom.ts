// import { toHex } from 'web3-utils'
import {
  EthereumAddress,
  EthereumTransactionAction,
  EthereumChainActionType,
  EthereumDecomposeReturn,
} from '../../../models'
import { erc721Abi } from '../../abis/erc721Abi'
import { toEthereumAddress, isNullOrEmptyEthereumValue } from '../../../helpers'
import { getArrayIndexOrNull } from '../../../../../helpers'

export interface Erc721SafeTransferFromParams {
  contractAddress: EthereumAddress
  from?: EthereumAddress
  transferFrom: EthereumAddress
  to: EthereumAddress
  tokenId: number
}

export const composeAction = ({ contractAddress, from, transferFrom, to, tokenId }: Erc721SafeTransferFromParams) => {
  const contract = {
    abi: erc721Abi,
    parameters: [transferFrom, to, tokenId],
    method: 'safeTransferFrom',
  }
  return {
    to: contractAddress,
    from,
    contract,
  }
}

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, contract } = action
  if (contract?.abi === erc721Abi && contract?.method === 'safeTransferFrom') {
    const returnData: Erc721SafeTransferFromParams = {
      contractAddress: to,
      from,
      transferFrom: toEthereumAddress(getArrayIndexOrNull(contract?.parameters, 0) as string),
      to: toEthereumAddress(getArrayIndexOrNull(contract?.parameters, 1) as string),
      tokenId: getArrayIndexOrNull(contract?.parameters, 2) as number,
    }
    const partial = !returnData?.from || isNullOrEmptyEthereumValue(to)
    return {
      chainActionType: EthereumChainActionType.ERC721SafeTransferFrom,
      args: returnData,
      partial,
    }
  }
  return null
}