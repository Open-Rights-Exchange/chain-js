/* eslint-disable no-restricted-syntax */
import { RpcError } from 'eosjs'
import { ChainError } from '../../errors'
import { stringifySafe } from '../../helpers'
import { ChainErrorType } from '../../models'

/**  subset of errors from EOS chain - https://github.com/EOSIO/eos/blob/master/libraries/chain/include/eosio/chain/exceptions.hpp
 * IMPORTANT: These are in order of importance
 * ... keep the Misc.. errors at the bottom - they catch the categories if not caught by a more specific error higher up */
export const ChainErrorRegExs: { [key: string]: string } = {
  AccountCreationFailedAlreadyExists: 'account_name_exists_exception',
  AccountDoesntExist: 'account_query_exception', // the account not on chain. Thrown by functions like link permission. Not thrown by get_account which throws 'unknown key \\(boost'
  AuthInvalid: 'authority_type_exception', // the permission isnt valid (or permission already exists in an account)
  AuthUnsatisfied: 'unsatisfied_authorization', // all permission or keys needed for transaction weren't provided
  AuthMissing: 'missing_auth_exception', // missing permission or key
  BlockDoesNotExist: 'unknown_block_exception',
  DataReadFailedKeyDoesNotExist: 'unknown key \\(boost',
  PermissionAlreadyLinked: 'Attempting to update required authority, but new requirement is same as old',
  PermissionNotLinked: 'Attempting to unlink authority, but no link found',
  PermissionDeleteFailedInUse:
    '(Cannot delete a linked authority. Unlink the authority first|Cannot delete active authority|Cannot delete owner authority)',
  TokenBalanceTooLow: 'this is set within chainState code',
  TxConfirmFailure: 'TxConfirmFailure',
  TxExceededResources: '_exceeded', // includes all EOS resources
  MiscChainError: 'chain_type_exception',
  MiscBlockValidationError: 'block_validate_exception',
  MiscTransactionError: 'transaction_exception',
  MiscActionValidationError: 'action_validate_exception',
  MiscContractError: 'contract_exception',
  MiscDatabaseError: 'database_exception',
  MiscBlockProducerError: 'producer_exception',
  MiscWhitelistBlackListError: 'whitelist_blacklist_exception',
  MiscNodeError:
    '(misc_exception|plugin_exception|wallet_exception|abi_exception|reversible_blocks_exception|block_log_exception|contract_api_exception|protocol_feature_exception|mongo_db_exception)',
  UnknownError: '(.*)', // matches anything - this is the catch all if nothing else matches
}

/**  Maps an Error object (thrown by a call to the chain) into a known set of errors
 *   RpcError is an eosjs structure that includes the 'json' property that has error details */
export function mapChainError(error: RpcError | Error): ChainError {
  let errorSearchString
  let errorMessage
  let errorJson
  let errorType = ChainErrorType.UnknownError

  if (error instanceof RpcError) {
    errorSearchString = `${error.name} ${error.message} ${stringifySafe(error.json)}` // includes the full body of the response from the HTTP request to the chain
    errorMessage = `${stringifySafe(error.json)}`
    errorJson = error.json
  } else if (error instanceof Error) {
    errorSearchString = `${error.name} ${error.message}`
    errorMessage = errorSearchString
  } else {
    errorSearchString = stringifySafe(error)
    errorMessage = errorSearchString
  }

  // loop through all possible ChainErrors and compare error string to regex for each ChainError
  // exit on first match - if no match for known errors, will match on the last one - UnkownError
  for (const errorKey of Object.keys(ChainErrorRegExs)) {
    const regexp = new RegExp(ChainErrorRegExs[errorKey], 'im')
    const match = regexp.exec(errorSearchString)
    if (match) {
      // map the key name of the regEx to the ChainErrorType enum
      errorType = (ChainErrorType as any)[errorKey] // map the key name to an enum with the same name (e.g. MiscChainError)
      break
    }
  }

  return new ChainError(errorType, errorMessage, errorJson)
}
