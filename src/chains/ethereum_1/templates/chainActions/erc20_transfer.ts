// import { toHex } from 'web3-utils'
import {
  EthereumAddress,
  EthereumTransactionAction,
  EthereumChainActionType,
  EthereumDecomposeReturn,
} from '../../models'
import { erc20Abi } from '../abis/erc20Abi'

interface erc20TransferParams {
  contractAddress: EthereumAddress
  from?: EthereumAddress
  to: EthereumAddress
  value: number
}

export const composeAction = ({ contractAddress, from, to, value }: erc20TransferParams) => {
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
  if (to && contract && contract.abi === erc20Abi && contract.method === 'transfer') {
    const returnData: Partial<erc20TransferParams> = {
      contractAddress: to,
      from,
      value: contract.parameters[0] as number,
    }
    const partial = !returnData?.from
    return {
      chainActionType: EthereumChainActionType.Erc20Transfer,
      args: returnData,
      partial,
    }
  }

  return null
}
