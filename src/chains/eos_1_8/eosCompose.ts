import { ChainActionType } from '../../models'
import { EosChainActionType, EosActionStruct } from './models'
import { notSupported } from '../../helpers'

import { composeAction as AccountCreateTemplate } from './templates/chainActions/account_create'
import { composeAction as AccountDeleteAuthTemplate } from './templates/chainActions/account_deleteAuth'
import { composeAction as AccountLinkAuthTemplate } from './templates/chainActions/account_linkAuth'
import { composeAction as AccountUnlinkAuthTemplate } from './templates/chainActions/account_unlinkAuth'
import { composeAction as AccountUpdateAuthTemplate } from './templates/chainActions/account_updateAuth'
import { composeAction as CreateEscrowCreateTemplate } from './templates/chainActions/createEscrow_create'
import { composeAction as CreateEscrowDefineTemplate } from './templates/chainActions/createEscrow_define'
import { composeAction as CreateEscrowInitTemplate } from './templates/chainActions/createEscrow_init'
import { composeAction as CreateEscrowReclaimTemplate } from './templates/chainActions/createEscrow_reclaim'
import { composeAction as CreateEscrowTransferTemplate } from './templates/chainActions/createEscrow_transfer'
import { composeAction as CreateEscrowWhitelistTemplate } from './templates/chainActions/createEscrow_whitelist'
import { composeAction as OreCreateAccountTemplate } from './templates/chainActions/ore_createAccount'
import { composeAction as OreUpsertRightTemplate } from './templates/chainActions/ore_upsertRight'
import { composeAction as TokenApproveTemplate } from './templates/chainActions/token_approve'
import { composeAction as TokenCreateTemplate } from './templates/chainActions/token_create'
import { composeAction as TokenIssueTemplate } from './templates/chainActions/token_issue'
import { composeAction as TokenRetireTemplate } from './templates/chainActions/token_retire'
import { composeAction as TokenTransferTemplate } from './templates/chainActions/token_transfer'
import { composeAction as TokenTransferFromTemplate } from './templates/chainActions/token_transferFrom'
import { composeAction as ValueTransferTemplate } from './templates/chainActions/value_transfer'

// map a key name to a function that returns an object
const ComposeAction: { [key: string]: (args: any) => any } = {
  // Standard actions
  AccountCreate: AccountCreateTemplate,
  AccountDeleteAuth: AccountDeleteAuthTemplate,
  AccountLinkAuth: AccountLinkAuthTemplate,
  AccountUnlinkAuth: AccountUnlinkAuthTemplate,
  AccountUpdateAuth: AccountUpdateAuthTemplate,
  TokenApprove: TokenApproveTemplate,
  TokenCreate: TokenCreateTemplate,
  TokenIssue: TokenIssueTemplate,
  TokenRetire: TokenRetireTemplate,
  TokenTransfer: TokenTransferTemplate,
  TokenTransferFrom: TokenTransferFromTemplate,
  ValueTransfer: ValueTransferTemplate,
  // EOS - specific action
  CreateEscrowCreate: CreateEscrowCreateTemplate,
  CreateEscrowDefine: CreateEscrowDefineTemplate,
  CreateEscrowInit: CreateEscrowInitTemplate,
  CreateEscrowReclaim: CreateEscrowReclaimTemplate,
  CreateEscrowTransfer: CreateEscrowTransferTemplate,
  CreateEscrowWhitelist: CreateEscrowWhitelistTemplate,
  OreCreateAccount: OreCreateAccountTemplate,
  OreUpsertRight: OreUpsertRightTemplate,
}

/** Compose an object for a chain contract action */
export function composeAction(chainActionType: ChainActionType | EosChainActionType, args: any): EosActionStruct {
  const composerFunction = ComposeAction[chainActionType as string]
  if (!composerFunction) {
    notSupported()
  }
  return composerFunction(args)
}
