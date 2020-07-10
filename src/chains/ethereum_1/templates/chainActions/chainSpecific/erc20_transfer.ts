import {
  EthereumAddress,
  EthereumTransactionAction,
  EthereumChainActionType,
  EthereumDecomposeReturn,
} from '../../../models'
import { erc20Abi } from '../../abis/erc20Abi'
import { getArrayIndexOrNull } from '../../../../../helpers'
import { ethereumTrxArgIsNullOrEmpty, toBigIntegerString } from '../../../helpers'
import { ERC_DEFAULT_TOKEN_PRECISION } from '../../../ethConstants'

export interface Erc20TransferParams {
  contractAddress: EthereumAddress
  from?: EthereumAddress
  precision?: number
  to: EthereumAddress
  value: string
}

export const composeAction = ({ contractAddress, from, precision, to, value }: Erc20TransferParams) => {
  const valueBigInt = toBigIntegerString(value, 10, precision || ERC_DEFAULT_TOKEN_PRECISION)
  const contract = {
    abi: erc20Abi,
    parameters: [to, valueBigInt],
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
  if (contract?.abi === erc20Abi && contract?.method === 'transfer') {
    const returnData: Erc20TransferParams = {
      contractAddress: to,
      from,
      to: getArrayIndexOrNull(contract?.parameters, 0) as string,
      value: getArrayIndexOrNull(contract?.parameters, 1) as string,
    }
    const partial = !returnData?.from || ethereumTrxArgIsNullOrEmpty(to)
    return {
      chainActionType: EthereumChainActionType.ERC20Transfer,
      args: returnData,
      partial,
    }
  }

  return null
}
