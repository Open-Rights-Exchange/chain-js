// import { toHex } from 'web3-utils'
import {
  EthereumAddress,
  EthereumTransactionAction,
  EthereumChainActionType,
  EthereumDecomposeReturn,
} from '../../../models'
import { erc20Abi } from '../../abis/erc20Abi'
import { toEthereumAddress, ethereumTrxArgIsNullOrEmpty, toBigIntegerString } from '../../../helpers'
import { getArrayIndexOrNull } from '../../../../../helpers'
import { ERC_DEFAULT_TOKEN_PRECISION } from '../../../ethConstants'

export interface Erc20ApproveParams {
  contractAddress: EthereumAddress
  from?: EthereumAddress
  precision?: number
  spender: EthereumAddress
  value: string
}

export const composeAction = ({ contractAddress, from, precision, spender, value }: Erc20ApproveParams) => {
  const valueBigInt = toBigIntegerString(value, 10, precision || ERC_DEFAULT_TOKEN_PRECISION)
  const contract = {
    abi: erc20Abi,
    parameters: [spender, valueBigInt],
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
    const partial = !returnData?.from || ethereumTrxArgIsNullOrEmpty(to)
    return {
      chainActionType: EthereumChainActionType.ERC20Approve,
      args: returnData,
      partial,
    }
  }

  return null
}
