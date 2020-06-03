// Standard actions
import { decomposeAction as TokenApproveTemplate } from './templates/chainActions/standard/token_approve'
import { decomposeAction as TokenTransferTemplate } from './templates/chainActions/standard/token_transfer'
import { decomposeAction as TokenTransferFromTemplate } from './templates/chainActions/standard/token_transferFrom'
import { decomposeAction as ValueTransferTemplate } from './templates/chainActions/standard/value_transfer'
// Chain-specific actions

import { decomposeAction as AccountCreateTemplate } from './templates/chainActions/chainSpecific/account_create'
import { decomposeAction as AccountDeleteAuthTemplate } from './templates/chainActions/chainSpecific/account_deleteAuth'
import { decomposeAction as AccountLinkAuthTemplate } from './templates/chainActions/chainSpecific/account_linkAuth'
import { decomposeAction as AccountUnlinkAuthTemplate } from './templates/chainActions/chainSpecific/account_unlinkAuth'
import { decomposeAction as AccountUpdateAuthTemplate } from './templates/chainActions/chainSpecific/account_updateAuth'
import { decomposeAction as CreateEscrowCreateTemplate } from './templates/chainActions/chainSpecific/createEscrow_create'
import { decomposeAction as CreateEscrowDefineTemplate } from './templates/chainActions/chainSpecific/createEscrow_define'
import { decomposeAction as CreateEscrowInitTemplate } from './templates/chainActions/chainSpecific/createEscrow_init'
import { decomposeAction as CreateEscrowReclaimTemplate } from './templates/chainActions/chainSpecific/createEscrow_reclaim'
import { decomposeAction as CreateEscrowTransferTemplate } from './templates/chainActions/chainSpecific/createEscrow_transfer'
import { decomposeAction as CreateEscrowWhitelistTemplate } from './templates/chainActions/chainSpecific/createEscrow_whitelist'
import { decomposeAction as EosTokenApproveTemplate } from './templates/chainActions/chainSpecific/eosToken_approve'
import { decomposeAction as EosTokenCreateTemplate } from './templates/chainActions/chainSpecific/eosToken_create'
import { decomposeAction as EosTokenIssueTemplate } from './templates/chainActions/chainSpecific/eosToken_issue'
import { decomposeAction as EosTokenRetireTemplate } from './templates/chainActions/chainSpecific/eosToken_retire'
import { decomposeAction as EosTokenTransferTemplate } from './templates/chainActions/chainSpecific/eosToken_transfer'
import { decomposeAction as EosTokenTransferFromTemplate } from './templates/chainActions/chainSpecific/eosToken_transferFrom'
import { decomposeAction as OreCreateAccountTemplate } from './templates/chainActions/chainSpecific/ore_createAccount'
import { decomposeAction as OreUpsertRightTemplate } from './templates/chainActions/chainSpecific/ore_upsertRight'
import { EosActionStruct, EosDecomposeReturn } from './models'
import { isNullOrEmpty } from '../../helpers'

// map a key name to a function that returns an object
const DecomposeAction: { [key: string]: (args: any) => any } = {
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

/** Decompose a transaction action to determine its standard action type (if any) and retrieve its data */
export function decomposeAction(action: EosActionStruct): EosDecomposeReturn[] {
  const decomposeActionFuncs = Object.values(DecomposeAction)
  const actionData: EosDecomposeReturn[] = []

  // interate over all possible decompose and return all that can be decomposed (i.e returns a chainActionType from decomposeFunc)
  decomposeActionFuncs.forEach((decomposeFunc: any) => {
    try {
      const { chainActionType, args, partial } = decomposeFunc(action) || {}
      if (chainActionType) {
        actionData.push({ chainActionType, args, partial })
      }
    } catch (err) {
      // console.log('problem in decomposeAction:', err)
    }
  })

  // return null and not an empty array if no matches
  return !isNullOrEmpty(actionData) ? actionData : null
}
