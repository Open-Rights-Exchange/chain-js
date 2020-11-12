// subset of errors from EOS chain - https://github.com/EOSIO/eos/blob/master/libraries/chain/include/eosio/chain/exceptions.hpp
// IMPORTANT: These are in order of importance
// ... keep the Misc.. errors at the bottom - they catch the categories if not caught by a more specific error higher up
export enum ChainErrorType {
  AccountCreationFailedAlreadyExists = 'AccountCreationFailedAlreadyExists',
  AccountDoesntExist = 'AccountDoesntExist',
  /** authority is not valid */
  AuthInvalid = 'AuthInvalid',
  /** missing permission or key */
  AuthMissing = 'AuthMissing',
  AuthUnsatisfied = 'AuthUnsatisfied',
  BlockDoesNotExist = 'BlockDoesNotExist',
  DataReadFailedKeyDoesNotExist = 'DataReadFailedKeyDoesNotExist',
  PermissionAlreadyLinked = 'PermissionAlreadyLinked',
  PermissionNotLinked = 'PermissionNotLinked',
  PermissionDeleteFailedInUse = 'PermissionDeleteFailedInUse',
  TokenBalanceTooLow = 'TokenBalanceTooLow',
  TxConfirmFailure = 'TxConfirmFailure',
  TxExceededResources = 'TxExceededResources',
  TxNotFoundOnChain = 'TxNotFoundOnChain',
  MiscChainError = 'MiscChainError',
  MiscBlockValidationError = 'MiscBlockValidationError',
  MiscTransactionError = 'MiscTransactionError',
  MiscActionValidationError = 'MiscActionValidationError',
  MiscContractError = 'MiscContractError',
  MiscDatabaseError = 'MiscDatabaseError',
  MiscBlockProducerError = 'MiscBlockProducerError',
  MiscWhitelistBlackListError = 'MiscWhitelistBlackListError',
  MiscNodeError = 'MiscNodeError',
  /** matches anything - this is the catch all if nothing else matches */
  UnknownError = 'UnknownError',
}

/** Additional chain-specific error detail which adds more insight to the cause of an error
 *  Often used as a subcategory of ErrorType e.g. what specific error caused the ErrorType TxConfirmFailure
 *  Optionaly included in ChainError's json metadata (i.e. ChainError.json.errorDetailCode)
 */
export enum ChainErrorDetailCode {
  ConfirmTransactionTimeout = 'ConfirmTransactionTimeout',
  MaxBlockReadAttemptsTimeout = 'MaxBlockReadAttemptsTimeout',
}
