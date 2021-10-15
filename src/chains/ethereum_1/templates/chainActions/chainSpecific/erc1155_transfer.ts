// import { toHex } from 'web3-utils'
import {
  EthereumAddress,
  EthereumTransactionAction,
  EthereumDecomposeReturn,
  EthereumChainActionType,
} from '../../../models'
import { erc1155Abi } from '../../abis/erc1155Abi'
import { toEthereumAddress, isNullOrEmptyEthereumValue } from '../../../helpers'
import { getArrayIndexOrNull } from '../../../../../helpers'

export interface Erc1155TransferParams {
  contractAddress: EthereumAddress
  from?: EthereumAddress
  to: EthereumAddress
  tokenId: number
  quantity: number
  data: string
}

export const composeAction = ({ contractAddress, from, to, tokenId, quantity, data }: Erc1155TransferParams) => {
  const contract = {
    abi: erc1155Abi,
    parameters: [to, tokenId, quantity, data],
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
  if (contract?.abi === erc1155Abi && contract?.method === 'transfer') {
    const returnData: Erc1155TransferParams = {
      contractAddress: to,
      from,
      to: toEthereumAddress(getArrayIndexOrNull(contract?.parameters, 0) as string),
      tokenId: getArrayIndexOrNull(contract?.parameters, 1) as number,
    }
    const partial = !returnData?.from || isNullOrEmptyEthereumValue(to)
    return {
      chainActionType: EthereumChainActionType.ERC1155Transfer,
      args: returnData,
      partial,
    }
  }

  return null
}
