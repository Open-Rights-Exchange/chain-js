// import { toHex } from 'web3-utils'
import {
  EthereumAddress,
  EthereumChainActionType,
  EthereumTransactionAction,
  EthereumDecomposeReturn,
  EthereumValue,
} from '../../../models'
import { erc20Abi } from '../../abis/erc20Abi'
import { getArrayIndexOrNull } from '../../../../../helpers'
import { ethereumTrxArgIsNullOrEmpty } from '../../../helpers'

interface Erc20IssueParams {
  contractAddress: EthereumAddress
  from?: EthereumAddress
  value: EthereumValue
}

export const composeAction = ({ contractAddress, from, value }: Erc20IssueParams) => {
  const contract = {
    abi: erc20Abi,
    parameters: [value],
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
      value: getArrayIndexOrNull(contract?.parameters, 0) as number,
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
