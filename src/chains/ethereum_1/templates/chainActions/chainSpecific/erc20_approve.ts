// import { toHex } from 'web3-utils'
import {
  EthereumAddress,
  EthereumTransactionAction,
  EthereumChainActionType,
  EthereumDecomposeReturn,
} from '../../../models'
import { erc20Abi } from '../../abis/erc20Abi'
import { toEthereumAddress, isNullOrEmptyEthereumValue } from '../../../helpers'
import { getArrayIndexOrNull, toTokenValueString } from '../../../../../helpers'

export interface Erc20ApproveParams {
  contractAddress: EthereumAddress
  from?: EthereumAddress
  precision?: number
  spender: EthereumAddress
  value: string
}

export const composeAction = ({ contractAddress, from, precision, spender, value }: Erc20ApproveParams) => {
  const valueString = toTokenValueString(value, 10, precision)
  const contract = {
    abi: erc20Abi,
    parameters: [spender, valueString],
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
    const returnData: Erc20ApproveParams = {
      contractAddress: to,
      from,
      spender: toEthereumAddress(getArrayIndexOrNull(contract?.parameters, 0) as string),
      value: getArrayIndexOrNull(contract?.parameters, 1) as string,
    }
    const partial = !returnData?.from || isNullOrEmptyEthereumValue(to)
    return {
      chainActionType: EthereumChainActionType.ERC20Approve,
      args: returnData,
      partial,
    }
  }

  return null
}
