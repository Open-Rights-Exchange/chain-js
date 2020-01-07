import { stringifySafe } from './helpers'

// subset of errors from EOS chain - https://github.com/EOSIO/eos/blob/master/libraries/chain/include/eosio/chain/exceptions.hpp
// IMPORTANT: These are in order of importance
// ... keep the Misc.. errors at the bottom - they catch the categories if not caught by a more specific error higher up
export enum ChainErrorType {
  AccountCreationFailedAlreadyExists = 'AccountCreationFailedAlreadyExists',
  AuthUnsatisfied = 'AuthUnsatisfied', // all permission or keys needed for transaction weren't provided
  AuthMissing = 'AuthMissing', // missing permission or key
  BlockDoesNotExist = 'BlockDoesNotExist',
  TxExceededResources = 'TxExceededResources', // includes all EOS resources
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
  UnknownError = 'UnknownError', // matches anything - this is the catch all if nothing else matches
}

/** Holds detailed error information */
export class ChainError extends Error {
  public errorType: ChainErrorType

  /** json of additional chain error data - if available */
  public json: any

  constructor(errorType: ChainErrorType, message: string, json: any) {
    super(message)
    this.json = json
    this.errorType = errorType
    Object.setPrototypeOf(this, ChainError.prototype)
  }
}

export function throwNewError(message: string, code?: string, parentError?: Error) {
  let messageToReturn = message
  if (parentError) {
    // add parentError to message
    messageToReturn = `${message} - Parent Error: ${stringifySafe(parentError)}`
  }
  const error = new Error(messageToReturn)
  error.name = code
  throw error
}

export function throwAndLogError(message: string, code?: string, parentError?: Error) {
  // TODO: log error
  throwNewError(message, code, parentError)
}
