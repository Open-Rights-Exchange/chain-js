import { decomposeAction as AccountCreateTemplate } from './templates/chainActions/account_create'
import { decomposeAction as AccountDeleteAuthTemplate } from './templates/chainActions/account_deleteAuth'
import { decomposeAction as AccountLinkAuthTemplate } from './templates/chainActions/account_linkAuth'
import { decomposeAction as AccountUnlinkAuthTemplate } from './templates/chainActions/account_unlinkAuth'
import { decomposeAction as AccountUpdateAuthTemplate } from './templates/chainActions/account_updateAuth'
import { decomposeAction as CreateEscrowCreateTemplate } from './templates/chainActions/createEscrow_create'
import { decomposeAction as CreateEscrowDefineTemplate } from './templates/chainActions/createEscrow_define'
import { decomposeAction as CreateEscrowInitTemplate } from './templates/chainActions/createEscrow_init'
import { decomposeAction as CreateEscrowReclaimTemplate } from './templates/chainActions/createEscrow_reclaim'
import { decomposeAction as CreateEscrowTransferTemplate } from './templates/chainActions/createEscrow_transfer'
import { decomposeAction as CreateEscrowWhitelistTemplate } from './templates/chainActions/createEscrow_whitelist'
import { decomposeAction as OreCreateAccountTemplate } from './templates/chainActions/ore_createAccount'
import { decomposeAction as OreUpsertRightTemplate } from './templates/chainActions/ore_upsertRight'
import { decomposeAction as TokenApproveTemplate } from './templates/chainActions/token_approve'
import { decomposeAction as TokenCreateTemplate } from './templates/chainActions/token_create'
import { decomposeAction as TokenIssueTemplate } from './templates/chainActions/token_issue'
import { decomposeAction as TokenRetireTemplate } from './templates/chainActions/token_retire'
import { decomposeAction as TokenTransferTemplate } from './templates/chainActions/token_transfer'
import { decomposeAction as TokenTransferFromTemplate } from './templates/chainActions/token_transferFrom'
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
  TokenCreate: TokenCreateTemplate,
  TokenIssue: TokenIssueTemplate,
  TokenRetire: TokenRetireTemplate,
  TokenTransfer: TokenTransferTemplate,
  TokenTransferFrom: TokenTransferFromTemplate,
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

/** Decompose a transaction action to determine its standard action type (if any) and retrieve its data */
export function decomposeAction(action: EosActionStruct): EosDecomposeReturn[] {
  const decomposeActionFuncs = Object.values(DecomposeAction)
  const actionData: EosDecomposeReturn[] = []

  // interate over all possible decompose and return all that can be decomposed (i.e returns a chainActionType from decomposeFunc)
  decomposeActionFuncs.forEach((decomposeFunc: any) => {
    const { chainActionType, args, partial } = decomposeFunc(action) || {}
    if (chainActionType) {
      actionData.push({ chainActionType, args, partial })
    }
  })
  // return null and not an empty array if no matches
  return !isNullOrEmpty(actionData) ? actionData : null
}
