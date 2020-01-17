import { ChainActionType } from '../../models'

import { action as AccountCreateTemplate } from './templates/chainActions/account_create'
import { action as AccountDeleteAuthTemplate } from './templates/chainActions/account_deleteAuth'
import { action as AccountLinkAuthTemplate } from './templates/chainActions/account_linkAuth'
import { action as AccountUnlinkAuthTemplate } from './templates/chainActions/account_unlinkAuth'
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
export const ChainAction: { [key: string]: (args: any) => any } = {
  AccountCreate: AccountCreateTemplate,
  AccountDeleteAuth: AccountDeleteAuthTemplate,
  AccountLinkAuth: AccountLinkAuthTemplate,
  AccountUnlinkAuth: AccountUnlinkAuthTemplate,
  AccountUpdateAuth: AccountUpdateAuthTemplate,
  CreateEscrowCreate: CreateEscrowCreateTemplate,
  CreateEscrowDefine: CreateEscrowDefineTemplate,
  CreateEscrowInit: CreateEscrowInitTemplate,
  CreateEscrowReclaim: CreateEscrowReclaimTemplate,
  CreateEscrowTransfer: CreateEscrowTransferTemplate,
  CreateEscrowWhitelist: CreateEscrowWhitelistTemplate,
  OreCreateAccount: OreCreateAccountTemplate,
  OreUpsertRight: OreUpsertRightTemplate,
  TokenApprove: TokenApproveTemplate,
  TokenCreate: TokenCreateTemplate,
  TokenIssue: TokenIssueTemplate,
  TokenRetire: TokenRetireTemplate,
  TokenTransfer: TokenTransferTemplate,
  TokenTransferFrom: TokenTransferFromTemplate,
}

export function composeAction(actionType: ChainActionType | EosChainActionType, args: any): any {
  // const composerFunction = ChainActionType[actionType];
  const composerFunction = ChainAction[actionType as string]
  return composerFunction(args)
}
