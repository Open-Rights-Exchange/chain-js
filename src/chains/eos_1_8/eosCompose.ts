import { ChainActionType } from '../../models'

import { action as AccountCreateTemplate } from './templates/chainActions/account_create'
import { action as AccountDeleteAuthTemplate } from './templates/chainActions/account_deleteAuth'
import { action as AccountLinkAuthTemplate } from './templates/chainActions/account_linkAuth'
import {
  composeAction as AccountUnlinkAuthTemplate_Compose,
  decomposeAction as AccountUnlinkAuthTemplate_Decompose,
} from './templates/chainActions/account_unlinkAuth'
import { action as AccountUpdateAuthTemplate } from './templates/chainActions/account_updateAuth'
import { action as CreateEscrowCreateTemplate } from './templates/chainActions/createEscrow_create'
import { action as CreateEscrowDefineTemplate } from './templates/chainActions/createEscrow_define'
import { action as CreateEscrowInitTemplate } from './templates/chainActions/createEscrow_init'
import { action as CreateEscrowReclaimTemplate } from './templates/chainActions/createEscrow_reclaim'
import { action as CreateEscrowTransferTemplate } from './templates/chainActions/createEscrow_transfer'
import { action as CreateEscrowWhitelistTemplate } from './templates/chainActions/createEscrow_whitelist'
import { action as OreCreateAccountTemplate } from './templates/chainActions/ore_createAccount'
import { action as OreUpsertRightTemplate } from './templates/chainActions/ore_upsertRight'
import { action as TokenApproveTemplate } from './templates/chainActions/token_approve'
import { action as TokenCreateTemplate } from './templates/chainActions/token_create'
import { action as TokenIssueTemplate } from './templates/chainActions/token_issue'
import { action as TokenRetireTemplate } from './templates/chainActions/token_retire'
import { action as TokenTransferTemplate } from './templates/chainActions/token_transfer'
import { action as TokenTransferFromTemplate } from './templates/chainActions/token_transferFrom'

export const enum EosChainActionType {}

// map a key name to a function that returns an object
export const ComposeAction: { [key: string]: (args: any) => any } = {
  AccountCreate: AccountCreateTemplate_Compose,
  AccountDeleteAuth: AccountDeleteAuthTemplate_Compose,
  AccountLinkAuth: AccountLinkAuthTemplate_Compose,
  AccountUnlinkAuth: AccountUnlinkAuthTemplate_Compose,
  AccountUpdateAuth: AccountUpdateAuthTemplate_Compose,
  CreateEscrowCreate: CreateEscrowCreateTemplate_Compose,
  CreateEscrowDefine: CreateEscrowDefineTemplate_Compose,
  CreateEscrowInit: CreateEscrowInitTemplate_Compose,
  CreateEscrowReclaim: CreateEscrowReclaimTemplate_Compose,
  CreateEscrowTransfer: CreateEscrowTransferTemplate_Compose,
  CreateEscrowWhitelist: CreateEscrowWhitelistTemplate_Compose,
  OreCreateAccount: OreCreateAccountTemplate_Compose,
  OreUpsertRight: OreUpsertRightTemplate_Compose,
  TokenApprove: TokenApproveTemplate_Compose,
  TokenCreate: TokenCreateTemplate_Compose,
  TokenIssue: TokenIssueTemplate_Compose,
  TokenRetire: TokenRetireTemplate_Compose,
  TokenTransfer: TokenTransferTemplate_Compose,
  TokenTransferFrom: TokenTransferFromTemplate_Compose,
}

// map a key name to a function that returns an object
export const DecomposeAction: { [key: string]: (args: any) => any } = {
  AccountCreate: AccountCreateTemplate_Decompose,
  AccountDeleteAuth: AccountDeleteAuthTemplate_Decompose,
  AccountLinkAuth: AccountLinkAuthTemplate_Decompose,
  AccountUnlinkAuth: AccountUnlinkAuthTemplate_Decompose,
  AccountUpdateAuth: AccountUpdateAuthTemplate_Decompose,
  CreateEscrowCreate: CreateEscrowCreateTemplate_Decompose,
  CreateEscrowDefine: CreateEscrowDefineTemplate_Decompose,
  CreateEscrowInit: CreateEscrowInitTemplate_Decompose,
  CreateEscrowReclaim: CreateEscrowReclaimTemplate_Decompose,
  CreateEscrowTransfer: CreateEscrowTransferTemplate_Decompose,
  CreateEscrowWhitelist: CreateEscrowWhitelistTemplate_Decompose,
  OreCreateAccount: OreCreateAccountTemplate_Decompose,
  OreUpsertRight: OreUpsertRightTemplate_Decompose,
  TokenApprove: TokenApproveTemplate_Decompose,
  TokenCreate: TokenCreateTemplate_Decompose,
  TokenIssue: TokenIssueTemplate_Decompose,
  TokenRetire: TokenRetireTemplate_Decompose,
  TokenTransfer: TokenTransferTemplate_Decompose,
  TokenTransferFrom: TokenTransferFromTemplate_Decompose,
}

export function composeAction(chainActionType: ChainActionType | EosChainActionType, args: any): any {
  // const composerFunction = ChainActionType[actionType];
  const composerFunction = ComposeAction[chainActionType as string]
  return composerFunction(args)
}

export function decomposeAction(action: any): { chainActionType: ChainActionType | EosChainActionType; args: any } {
  // const composerFunction = ChainActionType[actionType];

  // LOOP  through every DecomposeAction and call it and check if it returns a actionType, if it does, return actionType and args
  // ... loop
  //... const decomposerFunction = DecomposeAction[action as any]
  // { actionType, args } = decomposerFunction(action)
  // if (actionType) {
  //  return { chainActionType: actionType, args }
  // ... continue loop

}
