/* eslint-disable import/no-unresolved */
/* eslint-disable quote-props */

import { ChainActionType } from '../../models'
import { notSupported } from '../../helpers'

// standard actions
import { composeAction as TokenApproveTemplate } from './templates/chainActions/standard/token_approve'
import { composeAction as TokenTransferFromTemplate } from './templates/chainActions/standard/token_transferFrom'
import { composeAction as TokenTransferTemplate } from './templates/chainActions/standard/token_transfer'
import { composeAction as ValueTransferTemplate } from './templates/chainActions/standard/value_transfer'
// Chain-specific actions
import { composeAction as ERC20ApproveTemplate } from './templates/chainActions/chainSpecific/erc20_approve'
import { composeAction as ERC20BurnTemplate } from './templates/chainActions/chainSpecific/erc20_burn'
import { composeAction as ERC20IssueTemplate } from './templates/chainActions/chainSpecific/erc20_issue'
import { composeAction as ERC20TransferTemplate } from './templates/chainActions/chainSpecific/erc20_transfer'
import { composeAction as ERC20TransferFromTemplate } from './templates/chainActions/chainSpecific/erc20_transferFrom'
import { composeAction as ERC677TransferAndCallTemplate } from './templates/chainActions/chainSpecific/erc677_transferAndCall'
import { composeAction as ERC721ApproveTemplate } from './templates/chainActions/chainSpecific/erc721_approve'
import { composeAction as ERC721TransferTemplate } from './templates/chainActions/chainSpecific/erc721_transfer'
import { composeAction as ERC721TransferFromTemplate } from './templates/chainActions/chainSpecific/erc721_transferFrom'
import { composeAction as ERC721SafeTransferFromTemplate } from './templates/chainActions/chainSpecific/erc721_safeTransferFrom'
import { composeAction as ERC1155ApproveTemplate } from './templates/chainActions/chainSpecific/erc1155_approve'
import { composeAction as ERC1155TransferTemplate } from './templates/chainActions/chainSpecific/erc1155_transfer'
import { composeAction as ERC1155SafeTransferFromTemplate } from './templates/chainActions/chainSpecific/erc1155_safeTransferFrom'
import { EthereumChainActionType, EthereumTransactionAction } from './models'

// map a key name to a function that returns an object
const ComposeAction: { [key: string]: (args: any) => any } = {
  // Standard actions
  TokenApprove: TokenApproveTemplate,
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
  ERC721SafeTransferFrom: ERC721SafeTransferFromTemplate,
  ERC1155Approve: ERC1155ApproveTemplate,
  ERC1155Transfer: ERC1155TransferTemplate,
  ERC1155SafeTransferFrom: ERC1155SafeTransferFromTemplate,
}

/** Compose an object for a chain contract action */
export async function composeAction(
  chainActionType: ChainActionType | EthereumChainActionType,
  args: any,
): Promise<EthereumTransactionAction> {
  const composerFunction = ComposeAction[chainActionType as string]
  if (!composerFunction) {
    notSupported(`ComposeAction:${chainActionType}`)
  }
  return composerFunction(args)
}
