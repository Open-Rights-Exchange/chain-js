import {
  EthereumAddress,
  EthereumValue,
  EthereumTransactionAction,
  EthereumDecomposeReturn,
  EthereumChainActionType,
} from '../../../models'
import { erc20Abi } from '../../abis/erc20Abi'
import { toEthereumAddress, ethereumTrxArgIsNullOrEmpty, toBigIntegerString } from '../../../helpers'
import { getArrayIndexOrNull } from '../../../../../helpers'
import { ERC_DEFAULT_TOKEN_PRECISION } from '../../../ethConstants'

export interface Erc20TransferAndCallParams {
  contractAddress: EthereumAddress
  from?: EthereumAddress
  precision?: number
  to: EthereumAddress
  value: string
  data: EthereumValue[]
}

export const composeAction = ({ contractAddress, from, precision, to, value, data }: Erc20TransferAndCallParams) => {
  const valueBigInt = toBigIntegerString(value, 10, precision || ERC_DEFAULT_TOKEN_PRECISION)
  const contract = {
    abi: erc20Abi,
    parameters: [to, valueBigInt, data],
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
      data: getArrayIndexOrNull(contract?.parameters, 2) as EthereumValue[],
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
