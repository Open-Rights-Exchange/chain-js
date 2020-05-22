import { ChainActionType } from '../../../../models'
import { EthereumAddress, EthereumTransactionAction, EthereumDecomposeReturn } from '../../models'
import { composeAction as erc20Issue } from './erc20_issue'
import { erc20Abi } from '../abis/erc20Abi'
import { getArrayIndexOrNull } from '../../../../helpers'
import { ethereumTrxArgIsNullOrEmpty } from '../../helpers'

interface tokenIssueParams {
  fromAccountName?: EthereumAddress
  tokenAmount?: number
  contractName?: EthereumAddress
}

// TODO: Call erc20 transfer compose action by default instead of recreating the values here
export const composeAction = ({ fromAccountName, tokenAmount, contractName }: tokenIssueParams) => ({
  ...erc20Issue({
    contractAddress: contractName,
    from: fromAccountName,
    value: tokenAmount,
  }),
})

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { to, from, contract } = action
  if (contract && contract.abi === erc20Abi && contract.method === 'issue') {
    const returnData: Partial<tokenIssueParams> = {
      contractName: to,
      fromAccountName: from,
      tokenAmount: getArrayIndexOrNull(contract.parameters, 0) as number,
    }
    const partial = !returnData?.fromAccountName || ethereumTrxArgIsNullOrEmpty(to)
    return {
      chainActionType: ChainActionType.TokenIssue,
      args: returnData,
      partial,
    }
  }
  return null
}
