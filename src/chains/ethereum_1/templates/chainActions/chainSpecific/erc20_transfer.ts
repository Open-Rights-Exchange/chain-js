import {
  EthereumAddress,
  EthereumTransactionAction,
  EthereumChainActionType,
  EthereumDecomposeReturn,
} from '../../../models'
import { erc20Abi } from '../../abis/erc20Abi'
import { getArrayIndexOrNull, toTokenValueString } from '../../../../../helpers'
import { matchKnownAbiTypes, isNullOrEmptyEthereumValue, toEthereumAddress } from '../../../helpers'

export interface Erc20TransferParams {
  contractAddress: EthereumAddress
  from?: EthereumAddress
  precision?: number
  to: EthereumAddress
  value: string
}

export const composeAction = ({ contractAddress, from, precision, to, value }: Erc20TransferParams) => {
  const valueString = toTokenValueString(value, 10, precision)
  const contract = {
    abi: erc20Abi,
    parameters: [to, valueString],
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

  const abiType = matchKnownAbiTypes(contract)
  if (abiType.erc20 && contract?.method === 'transfer') {
    const returnData: Erc20TransferParams = {
      contractAddress: to,
      from,
      to: toEthereumAddress(getArrayIndexOrNull(contract?.parameters, 0) as string),
      value: getArrayIndexOrNull(contract?.parameters, 1) as string,
    }
    const partial = !returnData?.from || isNullOrEmptyEthereumValue(to)
    return {
      chainActionType: EthereumChainActionType.ERC20Transfer,
      args: returnData,
      partial,
    }
  }

  return null
}
