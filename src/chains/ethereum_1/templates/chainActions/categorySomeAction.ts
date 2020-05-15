import { EthereumChainActionType } from '../../models'

interface someActionParams {
  someParam: string
}

export const composeAction = ({ someParam }: someActionParams) => ({
  someParam,
})

export const decomposeAction = (action: any) => {
  const { someParam } = action
  if (someParam) {
    return {
      actionType: EthereumChainActionType.CategorySomeAction,
      args: { ...action },
    }
  }

  return null
}
