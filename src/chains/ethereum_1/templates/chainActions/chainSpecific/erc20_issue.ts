import {
  EthereumAddress,
  EthereumChainActionType,
  EthereumTransactionAction,
  EthereumDecomposeReturn,
} from '../../../models'
import { erc20Abi } from '../../abis/erc20Abi'
import { getArrayIndexOrNull } from '../../../../../helpers'
import { ethereumTrxArgIsNullOrEmpty, toBigIntegerString } from '../../../helpers'
import { ERC_DEFAULT_TOKEN_PRECISION } from '../../../ethConstants'

export interface Erc20IssueParams {
  contractAddress: EthereumAddress
  from?: EthereumAddress
  precision?: number
  value: string
}

export const composeAction = ({ contractAddress, from, precision, value }: Erc20IssueParams) => {
  const valueBigInt = toBigIntegerString(value, 10, precision || ERC_DEFAULT_TOKEN_PRECISION)
  const contract = {
    abi: erc20Abi,
    parameters: [valueBigInt],
    method: 'issue',
  }
  return {
    to: contractAddress,
    from,
    contract,
  }
}

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, contract } = action
  if (contract?.abi === erc20Abi && contract?.method === 'issue') {
    const returnData: Erc20IssueParams = {
      contractAddress: to,
      from,
      value: getArrayIndexOrNull(contract?.parameters, 0) as string,
    }
    const partial = !returnData?.from || ethereumTrxArgIsNullOrEmpty(to)
    return {
      chainActionType: EthereumChainActionType.ERC20Issue,
      args: returnData,
      partial,
    }
  }

  return null
}
