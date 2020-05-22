// import { toHex } from 'web3-utils'
import {
  EthereumAddress,
  EthereumValue,
  EthereumTransactionAction,
  EthereumDecomposeReturn,
  EthereumChainActionType,
} from '../../models'
import { erc20Abi } from '../abis/erc20Abi'
import { toEthereumAddress } from '../../helpers'

interface erc20TransferAndCallParams {
  contractAddress: EthereumAddress
  from?: EthereumAddress
  to: EthereumAddress
  value: number
  data: EthereumValue[]
}

export const composeAction = ({ contractAddress, from, to, value, data }: erc20TransferAndCallParams) => {
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
  if (to && contract && contract.method === 'transferAndCall') {
    const returnData: Partial<erc20TransferAndCallParams> = {
      contractAddress: to,
      from,
      to: toEthereumAddress(contract.parameters[0] as string),
      value: contract.parameters[1] as number,
      data: contract.parameters[2] as EthereumValue[],
    }
    const partial = !returnData?.from
    return {
      chainActionType: EthereumChainActionType.Erc677TransferAndCall,
      args: returnData,
      partial,
    }
  }

  return null
}
