// import { toHex } from 'web3-utils'
import {
  EthereumAddress,
  EthereumValue,
  EthereumTransactionAction,
  EthereumDecomposeReturn,
  EthereumChainActionType,
} from '../../../models'
import { erc20Abi } from '../../abis/erc20Abi'
import { toEthereumAddress, ethereumTrxArgIsNullOrEmpty } from '../../../helpers'
import { getArrayIndexOrNull } from '../../../../../helpers'

interface Erc20TransferAndCallParams {
  contractAddress: EthereumAddress
  from?: EthereumAddress
  to: EthereumAddress
  value: EthereumValue
  data: EthereumValue[]
}

export const composeAction = ({ contractAddress, from, to, value, data }: Erc20TransferAndCallParams) => {
  const contract = {
    abi: erc20Abi,
    parameters: [to, value, data],
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
      value: getArrayIndexOrNull(contract?.parameters, 1) as number,
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
