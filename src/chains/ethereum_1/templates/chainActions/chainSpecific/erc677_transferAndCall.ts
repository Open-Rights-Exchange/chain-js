import {
  EthereumAddress,
  EthereumMultiValue,
  EthereumTransactionAction,
  EthereumDecomposeReturn,
  EthereumChainActionType,
} from '../../../models'
import { erc20Abi } from '../../abis/erc20Abi'
import { toEthereumAddress, ethereumTrxArgIsNullOrEmpty, toTokenValueString } from '../../../helpers'
import { getArrayIndexOrNull } from '../../../../../helpers'

export interface Erc20TransferAndCallParams {
  contractAddress: EthereumAddress
  from?: EthereumAddress
  precision?: number
  to: EthereumAddress
  value: string
  data: EthereumMultiValue[]
}

export const composeAction = ({ contractAddress, from, precision, to, value, data }: Erc20TransferAndCallParams) => {
  const valueString = toTokenValueString(value, 10, precision)
  const contract = {
    abi: erc20Abi,
    parameters: [to, valueString, data],
    method: 'transferAndCall',
  }
  return {
    to: contractAddress,
    from,
    contract,
  }
}

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, contract } = action
  if (contract?.method === 'transferAndCall') {
    const returnData: Erc20TransferAndCallParams = {
      contractAddress: to,
      from,
      to: toEthereumAddress(getArrayIndexOrNull(contract?.parameters, 0) as string),
      value: getArrayIndexOrNull(contract?.parameters, 1) as string,
      data: getArrayIndexOrNull(contract?.parameters, 2) as EthereumMultiValue[],
    }
    const partial = !returnData?.from || ethereumTrxArgIsNullOrEmpty(to)
    return {
      chainActionType: EthereumChainActionType.ERC677TransferAndCall,
      args: returnData,
      partial,
    }
  }

  return null
}
