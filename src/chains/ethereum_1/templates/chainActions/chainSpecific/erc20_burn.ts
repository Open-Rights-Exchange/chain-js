// import { toHex } from 'web3-utils'
import {
  EthereumAddress,
  EthereumChainActionType,
  EthereumTransactionAction,
  EthereumDecomposeReturn,
} from '../../../models'
import { erc20Abi } from '../../abis/erc20Abi'
import { getArrayIndexOrNull } from '../../../../../helpers'
import { ethereumTrxArgIsNullOrEmpty, toTokenValueString } from '../../../helpers'

export interface Erc20BurnParams {
  contractAddress: EthereumAddress
  from?: EthereumAddress
  precision?: number
  value: string
}

export const composeAction = ({ contractAddress, from, precision, value }: Erc20BurnParams) => {
  const valueString = toTokenValueString(value, 10, precision)
  const contract = {
    abi: erc20Abi,
    parameters: [valueString],
    method: 'burn',
  }
  return {
    to: contractAddress,
    from,
    contract,
  }
}

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, contract } = action
  if (contract?.abi === erc20Abi && contract?.method === 'burn') {
    const returnData: Erc20BurnParams = {
      contractAddress: to,
      from,
      value: getArrayIndexOrNull(contract?.parameters, 0) as string,
    }
    const partial = !returnData?.from || ethereumTrxArgIsNullOrEmpty(to)
    return {
      chainActionType: EthereumChainActionType.ERC20Burn,
      args: returnData,
      partial,
    }
  }

  return null
}
