// import { toHex } from 'web3-utils'
import {
  EthereumAddress,
  EthereumTransactionAction,
  EthereumChainActionType,
  EthereumDecomposeReturn,
} from '../../models'
import { erc20Abi } from '../abis/erc20Abi'
import { getArrayIndexOrNull } from '../../../../helpers'
import { ethereumTrxArgIsNullOrEmpty } from '../../helpers'

interface Erc20TransferParams {
  contractAddress: EthereumAddress
  from?: EthereumAddress
  to: EthereumAddress
  value: number
}

export const composeAction = ({ contractAddress, from, to, value }: Erc20TransferParams) => {
  const contract = {
    abi: erc20Abi,
    parameters: [to, value],
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
      value: getArrayIndexOrNull(contract?.parameters, 1) as number,
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
