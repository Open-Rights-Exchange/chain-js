// import { toHex } from 'web3-utils'
import {
  EthereumAddress,
  EthereumTransactionAction,
  EthereumDecomposeReturn,
  EthereumChainActionType,
} from '../../models'
import { erc20Abi } from '../abis/erc20Abi'
import { toEthereumAddress, ethereumTrxArgIsNullOrEmpty } from '../../helpers'
import { getArrayIndexOrNull } from '../../../../helpers'

interface Erc20TransferFromParams {
  contractAddress: EthereumAddress
  from?: EthereumAddress
  transferFrom: EthereumAddress
  to: EthereumAddress
  value: number
}

export const composeAction = ({ contractAddress, from, transferFrom, to, value }: Erc20TransferFromParams) => {
  const contract = {
    abi: erc20Abi,
    parameters: [transferFrom, to, value],
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
      value: getArrayIndexOrNull(contract?.parameters, 2) as number,
    }
    const partial = !returnData?.from || ethereumTrxArgIsNullOrEmpty(to)
    return {
      chainActionType: EthereumChainActionType.ERC20TransferFrom,
      args: returnData,
      partial,
    }
  }

  return null
}
