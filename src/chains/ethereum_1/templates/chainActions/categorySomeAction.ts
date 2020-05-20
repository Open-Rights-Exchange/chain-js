import { EthereumChainActionType, EthereumTransactionAction, EthereumDecomposeReturn } from '../../models'

interface someActionParams {
  someParam: string
}

// TODO: What action type is this? Should it take in a consistent structure like EosActionStruct?
export const composeAction = ({ someParam }: someActionParams): EthereumTransactionAction => ({
  someParam,
})

export const decomposeAction = (action: EthereumTransactionAction): EthereumDecomposeReturn => {
  const { someParam } = action
  if (someParam) {
    return {
      chainActionType: EthereumChainActionType.CategorySomeAction,
      args: { ...action },
    }
  }

  return null
}
