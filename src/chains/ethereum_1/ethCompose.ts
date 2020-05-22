/* eslint-disable import/no-unresolved */
/* eslint-disable quote-props */

import { ChainActionType } from '../../models'
import { notSupported } from '../../helpers'

import { composeAction as TokenApproveTemplate } from './templates/chainActions/token_approve'
// import { composeAction as TokenCreateTemplate } from './templates/chainActions/token_create'
import { composeAction as TokenIssueTemplate } from './templates/chainActions/token_issue'
import { composeAction as TokenRetireTemplate } from './templates/chainActions/token_retire'
import { composeAction as TokenTransferTemplate } from './templates/chainActions/token_transfer'
import { composeAction as TokenTransferFromTemplate } from './templates/chainActions/token_transferFrom'
import { composeAction as ValueTransferTemplate } from './templates/chainActions/value_transfer'
import { composeAction as ERC20ApproveTemplate } from './templates/chainActions/erc20_approve'
import { composeAction as ERC20BurnTemplate } from './templates/chainActions/erc20_burn'
import { composeAction as ERC20IssueTemplate } from './templates/chainActions/erc20_issue'
import { composeAction as ERC20TransferTemplate } from './templates/chainActions/erc20_transfer'
import { composeAction as ERC20TransferFromTemplate } from './templates/chainActions/erc20_transferFrom'
import { composeAction as ERC677TransferAndCallTemplate } from './templates/chainActions/erc677_transferAndCall'
import { composeAction as ERC721ApproveTemplate } from './templates/chainActions/erc721_approve'
import { composeAction as ERC721TransferTemplate } from './templates/chainActions/erc721_transfer'
import { composeAction as ERC721TransferFromTemplate } from './templates/chainActions/erc721_transferFrom'
import { EthereumChainActionType, EthereumTransactionAction } from './models'

// map a key name to a function that returns an object
const ComposeAction: { [key: string]: (args: any) => any } = {
  // Standard actions
  TokenApprove: TokenApproveTemplate,
  // TokenCreate: TokenCreateTemplate,
  TokenIssue: TokenIssueTemplate,
  TokenRetire: TokenRetireTemplate,
  TokenTransfer: TokenTransferTemplate,
  TokenTransferFrom: TokenTransferFromTemplate,
  ValueTransfer: ValueTransferTemplate,
  // Eth - specific action
  ERC20Approve: ERC20ApproveTemplate,
  ERC20Burn: ERC20BurnTemplate,
  ERC20Issue: ERC20IssueTemplate,
  ERC20Transfer: ERC20TransferTemplate,
  ERC20TransferFrom: ERC20TransferFromTemplate,
  ERC677TransferAndCall: ERC677TransferAndCallTemplate,
  ERC721Approve: ERC721ApproveTemplate,
  ERC721Transfer: ERC721TransferTemplate,
  ERC721TransferFrom: ERC721TransferFromTemplate,
}

/** Compose an object for a chain contract action */
export function composeAction(
  chainActionType: ChainActionType | EthereumChainActionType,
  args: any,
): EthereumTransactionAction {
  const composerFunction = ComposeAction[chainActionType as string]
  if (!composerFunction) {
    notSupported()
  }
  return composerFunction(args)
}
