// import { toHex } from 'web3-utils'
import {
  EthereumAddress,
  EthereumTransactionAction,
  EthereumDecomposeReturn,
  EthereumChainActionType,
} from '../../models'
import { erc20Abi } from '../abis/erc20Abi'
import { toEthereumAddress } from '../../helpers'

interface erc20TransferFromParams {
  contractAddress: EthereumAddress
  from?: EthereumAddress
  transferFrom: EthereumAddress
  to: EthereumAddress
  value: number
}

export const composeAction = ({ contractAddress, from, transferFrom, to, value }: erc20TransferFromParams) => {
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
  if (to && contract && contract.method === 'transferFrom') {
    const returnData: Partial<erc20TransferFromParams> = {
      contractAddress: to,
      from,
      transferFrom: toEthereumAddress(contract.parameters[0] as string),
      to: toEthereumAddress(contract.parameters[1] as string),
      value: contract.parameters[2] as number,
    }
    const partial = !returnData?.from
    return {
      chainActionType: EthereumChainActionType.Erc20TransferFrom,
      args: returnData,
      partial,
    }
  }

  return null
}
