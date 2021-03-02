import { ChainActionType } from '../../../models'
import { PolkadotChainActionType } from './chainActionType'

export type PolkadotDecomposeReturn = {
  chainActionType: ChainActionType | PolkadotChainActionType
  args: any
  partial: boolean
}
