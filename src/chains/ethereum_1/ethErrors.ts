/* eslint-disable no-restricted-syntax */
import { ChainError } from '../../errors'
import { stringifySafe } from '../../helpers'
import { ChainErrorType } from '../../models'

// TODO: move this to another model file - it's generic after all - not just for errors
/** Category of chain functions - useful in error mapping */
export enum ChainFunctionCategory {
  Contract = 'Contract',
}

// subset of errors from Eteherum chain - {url to ETh errors}
// IMPORTANT: These are in order of importance
// ... keep the Misc.. errors at the bottom - they catch the categories if not caught by a more specific error higher up
export const DefaultChainErrorRegExs: { [key: string]: string } = {
  //        ErrSignFailed
  AuthInvalid: '(invalid transaction v, r, s values|public key|private key|invalid signature|signing failed)', // the permission isnt valid (or permission already exists in an account)
  BlockDoesNotExist: '(header for hash not found|neither block nor hash specified)',
  DataReadFailedKeyDoesNotExist: 'not found',
  TxExceededResources: '(insufficient funds|insufficient balance)', // insufficient funds for gas * price + value

  MiscTransactionError:
    '(gas limit|nonce too high|nonce too low|already known|invalid sender|transaction underpriced|gas too low|negative value|oversized data|txdata|for signer|execution timeout)',
  MiscDatabaseError: 'index out of bounds',
  UnknownError: '(.*)', // matches anything - this is the catch all if nothing else matches
}

/** For Contract category of chain actions and related error */
export const ContractErrorRegExs: { [key: string]: string } = {
  ContractDoesNotExist: 'not found',
  MiscContractError: '(.*)', // matches anything - this is the catch all if nothing else matches
}

/** Maps a category of errors to a regex collection */
export const ChainFunctionCategoryMap: { [key: string]: any } = {
  // ChainRead: ,
  // ChainStateRead: ,
  Contract: ContractErrorRegExs,
  // BlockRead: ,
  // Transaction:,
}

/** Maps an Error object (thrown by a call to the chain) into a known set of errors */
export function mapChainError(error: Error, chainFunctionCategory?: ChainFunctionCategory): ChainError {
  let errorSearchString
  let errorMessage
  let errorJson
  let errorType = ChainErrorType.UnknownError
  // default to using catch-all errors - (if we dont have a specific chainFunctionCategory)
  let regExErrorMap = DefaultChainErrorRegExs

  if (error instanceof Error) {
    errorSearchString = `${error.name} ${error.message}`
    errorMessage = errorSearchString
  } else {
    errorSearchString = stringifySafe(error)
    errorMessage = errorSearchString
  }

  // change regExErrorMap to match chainFunctionCategory - if provided
  if (chainFunctionCategory) {
    regExErrorMap = ChainFunctionCategoryMap[chainFunctionCategory]
  }

  // loop through all possible ChainErrors and compare error string to regex for each ChainError
  // exit on first match - if no match for known errors, will match on the last one - UnkownError
  for (const errorKey of Object.keys(regExErrorMap)) {
    const regexp = new RegExp(regExErrorMap[errorKey], 'im')
    const match = regexp.exec(errorSearchString)
    if (match) {
      errorType = (ChainErrorType as any)[errorKey] // map the key name to an enum with the same name (e.g. MiscChainError)
      break
    }
  }

  return new ChainError(errorType, errorMessage, errorJson)
}

// export enum ChainErrorType {
//   AccountCreationFailedAlreadyExists = 'AccountCreationFailedAlreadyExists',
//   AccountDoesntExist = 'AccountDoesntExist',
//   /** authority is not valid */
//   AuthInvalid = 'AuthInvalid',
//   /** missing permission or key */
//   AuthMissing = 'AuthMissing',
//   AuthUnsatisfied = 'AuthUnsatisfied',                                         // No feature
//   BlockDoesNotExist = 'BlockDoesNotExist',                                     // Returns null
//   DataReadFailedKeyDoesNotExist = 'DataReadFailedKeyDoesNotExist',
//   PermissionAlreadyLinked = 'PermissionAlreadyLinked',
//   PermissionNotLinked = 'PermissionNotLinked',
//   PermissionDeleteFailedInUse = 'PermissionDeleteFailedInUse',
//   TokenBalanceTooLow = 'TokenBalanceTooLow',
//   TxConfirmFailure = 'TxConfirmFailure',                                       // rejectAwaitTransaction function needs to be implemented
//   TxExceededResources = 'TxExceededResources',

//   MiscChainError = 'MiscChainError',
//   MiscBlockValidationError = 'MiscBlockValidationError',
//   MiscTransactionError = 'MiscTransactionError',
//   MiscActionValidationError = 'MiscActionValidationError',
//   MiscContractError = 'MiscContractError',
//   MiscDatabaseError = 'MiscDatabaseError',
//   MiscBlockProducerError = 'MiscBlockProducerError',
//   MiscWhitelistBlackListError = 'MiscWhitelistBlackListError',
//   MiscNodeError = 'MiscNodeError',
//   /** matches anything - this is the catch all if nothing else matches */
//   UnknownError = 'UnknownError',
// }

// export const ChainErrorRegExs: { [key: string]: string } = {
//   AccountCreationFailedAlreadyExists: 'account_name_exists_exception',
//   AccountDoesntExist: 'account_query_exception', // the account not on chain. Thrown by functions like link permission. Not thrown by get_account which throws 'unknown key \\(boost'
//   AuthInvalid: 'authority_type_exception', // the permission isnt valid (or permission already exists in an account)
//   AuthUnsatisfied: 'unsatisfied_authorization', // all permission or keys needed for transaction weren't provided
//   AuthMissing: 'missing_auth_exception', // missing permission or key
//   BlockDoesNotExist: 'unknown_block_exception',
//   DataReadFailedKeyDoesNotExist: 'unknown key \\(boost',
//   PermissionAlreadyLinked: 'Attempting to update required authority, but new requirement is same as old',
//   PermissionNotLinked: 'Attempting to unlink authority, but no link found',
//   PermissionDeleteFailedInUse:
//     '(Cannot delete a linked authority. Unlink the authority first|Cannot delete active authority|Cannot delete owner authority)',
//   TokenBalanceTooLow: 'this is set within chainState code',
//   TxConfirmFailure: 'TxConfirmFailure',
//   TxExceededResources: '_exceeded', // includes all EOS resources
//   MiscChainError: 'chain_type_exception',
//   MiscBlockValidationError: 'block_validate_exception',
//   MiscTransactionError: 'transaction_exception',
//   MiscActionValidationError: 'action_validate_exception',
//   MiscContractError: 'contract_exception',
//   MiscDatabaseError: 'database_exception',
//   MiscBlockProducerError: 'producer_exception',
//   MiscWhitelistBlackListError: 'whitelist_blacklist_exception',
//   MiscNodeError:
//     '(misc_exception|plugin_exception|wallet_exception|abi_exception|reversible_blocks_exception|block_log_exception|contract_api_exception|protocol_feature_exception|mongo_db_exception)',
//   UnknownError: '(.*)', // matches anything - this is the catch all if nothing else matches
// }
