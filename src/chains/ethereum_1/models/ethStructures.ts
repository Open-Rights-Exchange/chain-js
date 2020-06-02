import { ChainActionType } from '../../../models'
import { EthereumChainActionType } from './chainActionTypeModels'

export type EthereumDecomposeReturn = {
  chainActionType: ChainActionType | EthereumChainActionType
  args: any
  partial?: boolean
}
