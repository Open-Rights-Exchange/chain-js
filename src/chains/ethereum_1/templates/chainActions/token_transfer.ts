import { ChainActionType } from '../../../../models'
import { EthereumAddress, EthereumTransactionAction, EthereumDecomposeReturn } from '../../models'
import { composeAction as erc20Transfer } from './erc20_transfer'
import { erc20Abi } from '../abis/erc20Abi'

interface tokenTransferParams {
  fromAccountName?: EthereumAddress
  toAccountName?: EthereumAddress
  tokenAmount?: number
  contractName?: EthereumAddress
}

// TODO: Call erc20 transfer compose action by default instead of recreating the values here
export const composeAction = ({ fromAccountName, toAccountName, tokenAmount, contractName }: tokenTransferParams) => ({
  ...erc20Transfer({
    contractAddress: contractName,
    from: fromAccountName,
    to: toAccountName,
    value: tokenAmount,
  }),
})

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, contract } = action
  if (to && contract && contract.abi === erc20Abi && contract.method === 'transfer') {
    const returnData: Partial<tokenTransferParams> = {
      contractName: to,
      fromAccountName: from,
      tokenAmount: contract.parameters[0] as number,
    }
    const partial = !returnData?.fromAccountName
    return {
      chainActionType: ChainActionType.TokenTransfer,
      args: returnData,
      partial,
    }
  }

  return null
}
