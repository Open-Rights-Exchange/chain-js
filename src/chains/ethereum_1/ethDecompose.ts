/* eslint-disable import/no-unresolved */
/* eslint-disable quote-props */

import { decomposeAction as TokenApproveTemplate } from './templates/chainActions/token_approve'
import { decomposeAction as TokenCreateTemplate } from './templates/chainActions/token_create'
import { decomposeAction as TokenIssueTemplate } from './templates/chainActions/token_issue'
import { decomposeAction as TokenRetireTemplate } from './templates/chainActions/token_retire'
import { decomposeAction as TokenTransferTemplate } from './templates/chainActions/token_transfer'
import { decomposeAction as TokenTransferFromTemplate } from './templates/chainActions/token_transferFrom'
import { decomposeAction as ValueTransferTemplate } from './templates/chainActions/value_transfer'
import { decomposeAction as Erc20ApproveTemplate } from './templates/chainActions/erc20_approve'
import { decomposeAction as Erc20BurnTemplate } from './templates/chainActions/erc20_burn'
import { decomposeAction as Erc20IssueTemplate } from './templates/chainActions/erc20_issue'
import { decomposeAction as Erc20TransferTemplate } from './templates/chainActions/erc20_transfer'
import { decomposeAction as Erc20TransferFromTemplate } from './templates/chainActions/erc20_transferFrom'
import { decomposeAction as Erc677TransferAndCallTemplate } from './templates/chainActions/erc677_transferAndCall'
import { decomposeAction as Erc721ApproveTemplate } from './templates/chainActions/erc721_approve'
import { decomposeAction as Erc721TransferTemplate } from './templates/chainActions/erc721_transfer'
import { decomposeAction as Erc721TransferFromTemplate } from './templates/chainActions/erc721_transferFrom'

import { EthereumTransactionAction, EthereumDecomposeReturn } from './models'
import { isNullOrEmpty } from '../../helpers'

// map a key name to a function that returns an object
const DecomposeAction: { [key: string]: (args: any) => any } = {
  // Standard actions
  TokenApprove: TokenApproveTemplate,
  TokenCreate: TokenCreateTemplate,
  TokenIssue: TokenIssueTemplate,
  TokenRetire: TokenRetireTemplate,
  TokenTransfer: TokenTransferTemplate,
  TokenTransferFrom: TokenTransferFromTemplate,
  ValueTransfer: ValueTransferTemplate,
  // Eth - specific action
  Erc20Approve: Erc20ApproveTemplate,
  Erc20Burn: Erc20BurnTemplate,
  Erc20Issue: Erc20IssueTemplate,
  Erc20Transfer: Erc20TransferTemplate,
  Erc20TransferFrom: Erc20TransferFromTemplate,
  Erc677TransferAndCall: Erc677TransferAndCallTemplate,
  Erc721Approve: Erc721ApproveTemplate,
  Erc721Transfer: Erc721TransferTemplate,
  Erc721TransferFrom: Erc721TransferFromTemplate,
}

/** Decompose a transaction action to determine its standard action type (if any) and retrieve its data */
export function decomposeAction(action: EthereumTransactionAction): EthereumDecomposeReturn[] {
  const decomposeActionFuncs = Object.values(DecomposeAction)
  const decomposedActions: EthereumDecomposeReturn[] = []

  // interate over all possible decompose and return all that can be decomposed (i.e returns a chainActionType from decomposeFunc)
  decomposeActionFuncs.forEach((decomposeFunc: any) => {
    try {
      const { chainActionType, args } = decomposeFunc(action) || {}
      if (chainActionType) {
        decomposedActions.push({ chainActionType, args })
      }
    } catch (err) {
      // console.log('problem in decomposeAction:', err)
    }
  })

  // return null and not an empty array if no matches
  return !isNullOrEmpty(decomposedActions) ? decomposedActions : null
}
