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
  /** all permission or keys needed for transaction weren't provided */
  AuthUnsatisfied = 'AuthUnsatisfied',
  BlockDoesNotExist = 'BlockDoesNotExist',
  /** includes all EOS resources */
  TxExceededResources = 'TxExceededResources',
  PermissionAlreadyLinked = 'PermissionAlreadyLinked',
  PermissionNotLinked = 'PermissionNotLinked',
  PermissionDeleteFailedInUse = 'PermissionDeleteFailedInUse',
  DataReadFailedKeyDoesNotExist = 'DataReadFailedKeyDoesNotExist',
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
