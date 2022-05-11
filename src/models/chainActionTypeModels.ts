import { ChainEntityName, ChainSymbol } from './generalModels'

export enum ChainActionType {
  AccountCreate = 'AccountCreate',
  AccountDeleteAuth = 'AccountDeleteAuth',
  AccountLinkAuth = 'AccountLinkAuth',
  AccountUnlinkAuth = 'AccountUnlinkAuth',
  AccountUpdateAuth = 'AccountUpdateAuth',
  TokenApprove = 'TokenApprove',
  TokenTransfer = 'TokenTransfer',
  TokenTransferFrom = 'TokenTransferFrom',
  ValueTransfer = 'ValueTransfer',
}

export type ActionDecomposeReturn = {
  chainActionType: ChainActionType
  args: any
  partial?: boolean
}

// Standard Compose action parameters

export type TokenApproveParams = {
  contractName: ChainEntityName
  fromAccountName: ChainEntityName
  toAccountName: ChainEntityName
  amount: string
  precision?: number
  symbol: ChainSymbol
  memo?: string
  permission?: ChainEntityName
}

export type TokenTransferParams = {
  contractName?: ChainEntityName
  fromAccountName?: ChainEntityName
  toAccountName?: ChainEntityName
  amount: string
  precision?: number
  symbol: ChainSymbol
  memo?: string
  permission?: ChainEntityName
}

export type TokenTransferFromParams = {
  approvedAccountName: ChainEntityName
  contractName: ChainEntityName
  fromAccountName: ChainEntityName
  toAccountName: ChainEntityName
  amount: string
  precision?: number
  symbol: ChainSymbol
  memo?: string
  permission?: ChainEntityName
}

export type ValueTransferParams = {
  contractName?: ChainEntityName
  fromAccountName?: ChainEntityName
  toAccountName: ChainEntityName
  amount: string
  precision?: number
  symbol?: ChainSymbol | string
  memo?: string
  permission?: ChainEntityName
}
