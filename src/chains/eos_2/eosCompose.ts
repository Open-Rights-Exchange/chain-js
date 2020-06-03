import { ChainActionType } from '../../models'
import { EosChainActionType, EosActionStruct } from './models'
import { notSupported } from '../../helpers'

// Standard actions
import { composeAction as TokenApproveTemplate } from './templates/chainActions/standard/token_approve'
import { composeAction as TokenTransferFromTemplate } from './templates/chainActions/standard/token_transferFrom'
import { composeAction as TokenTransferTemplate } from './templates/chainActions/standard/token_transfer'
import { composeAction as ValueTransferTemplate } from './templates/chainActions/standard/value_transfer'
// Chain-specific actions
import { composeAction as AccountCreateTemplate } from './templates/chainActions/chainSpecific/account_create'
import { composeAction as AccountDeleteAuthTemplate } from './templates/chainActions/chainSpecific/account_deleteAuth'
import { composeAction as AccountLinkAuthTemplate } from './templates/chainActions/chainSpecific/account_linkAuth'
import { composeAction as AccountUnlinkAuthTemplate } from './templates/chainActions/chainSpecific/account_unlinkAuth'
import { composeAction as AccountUpdateAuthTemplate } from './templates/chainActions/chainSpecific/account_updateAuth'
import { composeAction as CreateEscrowCreateTemplate } from './templates/chainActions/chainSpecific/createEscrow_create'
import { composeAction as CreateEscrowDefineTemplate } from './templates/chainActions/chainSpecific/createEscrow_define'
import { composeAction as CreateEscrowInitTemplate } from './templates/chainActions/chainSpecific/createEscrow_init'
import { composeAction as CreateEscrowReclaimTemplate } from './templates/chainActions/chainSpecific/createEscrow_reclaim'
import { composeAction as CreateEscrowTransferTemplate } from './templates/chainActions/chainSpecific/createEscrow_transfer'
import { composeAction as CreateEscrowWhitelistTemplate } from './templates/chainActions/chainSpecific/createEscrow_whitelist'
import { composeAction as EosTokenApproveTemplate } from './templates/chainActions/chainSpecific/eosToken_approve'
import { composeAction as EosTokenCreateTemplate } from './templates/chainActions/chainSpecific/eosToken_create'
import { composeAction as EosTokenIssueTemplate } from './templates/chainActions/chainSpecific/eosToken_issue'
import { composeAction as EosTokenRetireTemplate } from './templates/chainActions/chainSpecific/eosToken_retire'
import { composeAction as EosTokenTransferTemplate } from './templates/chainActions/chainSpecific/eosToken_transfer'
import { composeAction as EosTokenTransferFromTemplate } from './templates/chainActions/chainSpecific/eosToken_transferFrom'
import { composeAction as OreCreateAccountTemplate } from './templates/chainActions/chainSpecific/ore_createAccount'
import { composeAction as OreUpsertRightTemplate } from './templates/chainActions/chainSpecific/ore_upsertRight'

// map a key name to a function that returns an object
const ComposeAction: { [key: string]: (args: any) => any } = {
  // Standard actions
  AccountCreate: AccountCreateTemplate,
  AccountDeleteAuth: AccountDeleteAuthTemplate,
  AccountLinkAuth: AccountLinkAuthTemplate,
  AccountUnlinkAuth: AccountUnlinkAuthTemplate,
  AccountUpdateAuth: AccountUpdateAuthTemplate,
  TokenApprove: TokenApproveTemplate,
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
  EosTokenApprove: EosTokenApproveTemplate,
  EosTokenCreate: EosTokenCreateTemplate,
  EosTokenIssue: EosTokenIssueTemplate,
  EosTokenRetire: EosTokenRetireTemplate,
  EosTokenTransfer: EosTokenTransferTemplate,
  EosTokenTransferFrom: EosTokenTransferFromTemplate,
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
