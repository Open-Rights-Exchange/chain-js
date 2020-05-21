import { EthereumChainActionType } from '../../models'

interface someActionParams {
  someParam: string
}

// TODO: What action type is this? Should it take in a consistent structure like EosActionStruct?
export const composeAction = ({ someParam }: someActionParams): any => ({
  someParam,
})

export const decomposeAction = (action: someActionParams): any => {
  const { someParam } = action
  if (someParam) {
    return {
      chainActionType: EthereumChainActionType.CategorySomeAction,
      args: { ...action },
    }
  }

  return null
}
