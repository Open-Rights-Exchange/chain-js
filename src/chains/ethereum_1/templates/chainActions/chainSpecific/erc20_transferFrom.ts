import {
  EthereumAddress,
  EthereumTransactionAction,
  EthereumDecomposeReturn,
  EthereumChainActionType,
} from '../../../models'
import { erc20Abi } from '../../abis/erc20Abi'
import { toEthereumAddress, isNullOrEmptyEthereumValue, toTokenValueString } from '../../../helpers'
import { getArrayIndexOrNull } from '../../../../../helpers'

export interface Erc20TransferFromParams {
  contractAddress: EthereumAddress
  from?: EthereumAddress
  precision?: number
  transferFrom: EthereumAddress
  to: EthereumAddress
  value: string
}

export const composeAction = ({
  contractAddress,
  from,
  precision,
  transferFrom,
  to,
  value,
}: Erc20TransferFromParams) => {
  const valueString = toTokenValueString(value, 10, precision)
  const contract = {
    abi: erc20Abi,
    parameters: [transferFrom, to, valueString],
    method: 'transferFrom',
  }
  return {
    to: contractAddress,
    from,
    contract,
  }
}

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, contract } = action
  if (contract?.abi === erc20Abi && contract?.method === 'transferFrom') {
    const returnData: Erc20TransferFromParams = {
      contractAddress: to,
      from,
      transferFrom: toEthereumAddress(getArrayIndexOrNull(contract?.parameters, 0) as string),
      to: toEthereumAddress(getArrayIndexOrNull(contract?.parameters, 1) as string),
      value: getArrayIndexOrNull(contract?.parameters, 2) as string,
    }
    const partial = !returnData?.from || isNullOrEmptyEthereumValue(to)
    return {
      chainActionType: EthereumChainActionType.ERC20TransferFrom,
      args: returnData,
      partial,
    }
  }

  return null
}
