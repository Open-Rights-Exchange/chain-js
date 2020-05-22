// import { toHex } from 'web3-utils'
import {
  EthereumAddress,
  EthereumTransactionAction,
  EthereumChainActionType,
  EthereumDecomposeReturn,
} from '../../models'
import { erc20Abi } from '../abis/erc20Abi'
import { toEthereumAddress, ethereumTrxArgIsNullOrEmpty } from '../../helpers'
import { getArrayIndexOrNull } from '../../../../helpers'

interface erc20ApproveParams {
  contractAddress: EthereumAddress
  from?: EthereumAddress
  spender: EthereumAddress
  value: number
}

export const composeAction = ({ contractAddress, from, spender, value }: erc20ApproveParams) => {
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

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, contract } = action
  if (contract?.abi === erc20Abi && contract?.method === 'approve') {
    const returnData: Partial<erc20ApproveParams> = {
      contractAddress: to,
      from,
      spender: toEthereumAddress(getArrayIndexOrNull(contract?.parameters, 0) as string),
      value: getArrayIndexOrNull(contract?.parameters, 1) as number,
    }
    const partial = !returnData?.from || ethereumTrxArgIsNullOrEmpty(to)
    return {
      chainActionType: EthereumChainActionType.ERC20Approve,
      args: returnData,
      partial,
    }
  }

  return null
}
