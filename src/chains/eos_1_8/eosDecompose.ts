import { ChainActionType } from '../../models'
import { EosChainActionType } from './models'

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

// map a key name to a function that returns an object
export const DecomposeAction: { [key: string]: (args: any) => any } = {
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

export function decomposeAction(action: any): { chainActionType: ChainActionType | EosChainActionType; args: any } {
  const decomposeActionFuncs = Object.values(DecomposeAction)
  let actionData = null

  // Using find to stop iterating once a match is found
  decomposeActionFuncs.find((decomposeFunc) => {
    const { actionType, args } = decomposeFunc(action)
    if (actionType) {
      actionData = { chainActionType: actionType, args }
      return true
    }
  })

  return actionData
}
