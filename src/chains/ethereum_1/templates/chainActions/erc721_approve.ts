// import { toHex } from 'web3-utils'
import {
  EthereumAddress,
  EthereumTransactionAction,
  EthereumDecomposeReturn,
  EthereumChainActionType,
} from '../../models'
import { erc721Abi } from '../abis/erc721Abi'
import { toEthereumAddress, ethereumTrxArgIsNullOrEmpty } from '../../helpers'
import { getArrayIndexOrNull } from '../../../../helpers'

interface erc721ApproveParams {
  contractAddress: EthereumAddress
  from?: EthereumAddress
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

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, contract } = action
  if (contract && contract.abi === erc721Abi && contract.method === 'approve') {
    const returnData: Partial<erc721ApproveParams> = {
      contractAddress: to,
      from,
      to: toEthereumAddress(getArrayIndexOrNull(contract.parameters, 0) as string),
      tokenId: getArrayIndexOrNull(contract.parameters, 1) as number,
    }
    const partial = !returnData?.from || ethereumTrxArgIsNullOrEmpty(to)
    return {
      chainActionType: EthereumChainActionType.Erc721Approve,
      args: returnData,
      partial,
    }
  }

  return null
}
