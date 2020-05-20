import { ChainActionType } from '../../../models'
import { EthereumChainActionType } from './chainActionTypeModels'

export type DecomposeReturn = {
  chainActionType: ChainActionType | EthereumChainActionType
  args: any
}
