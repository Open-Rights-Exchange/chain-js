import { stringifySafe } from './helpers'
import { ChainErrorDetailCode, ChainErrorType } from './models'

/** Provides additional info related to a chain error
 *  errorType - A ChainErrorType which is a common set of errors that span all chains
 *  originalError - The original error object thrown by the chain
 *  json - Additional data about the error (if provided by the chain) */
export class ChainError extends Error {
  public errorType: ChainErrorType

  /** json of additional chain error data - if available */
  public json: any

  /** original error from which this ChainError was composed */
  public originalError: Error

  constructor(errorType: ChainErrorType, message: string, json: any, originalError: Error) {
    super(message)
    this.json = json
    this.originalError = originalError
    this.errorType = errorType
    Object.setPrototypeOf(this, ChainError.prototype)
  }
}

export function throwNewError(message: string, code?: string, parentError?: Error) {
  let messageToReturn = message
  if (parentError) {
    // add parentError to message
    messageToReturn = `${message} - Parent Error: ${parentError?.message} ${stringifySafe(parentError)}`
  }
  const error = new Error(messageToReturn)
  if (code) {
    error.name = code
  }
  throw error
}

export function throwAndLogError(message: string, code?: string, parentError?: Error) {
  // TODO: log error
  throwNewError(message, code, parentError)
}

/**
 *  Resolves a promise (that was waiting for a transaction to confirm)
 */
export function resolveAwaitTransaction(resolve: any, transaction: any) {
  resolve(transaction)
}

/**
 *  Rejects a promise (that was waiting for a transaction to confirm)
 *  All errors are of ErrorType TxConfirmFailure - A more specfic cause of the error is passed via errorDetailCode param
 */
export function rejectAwaitTransaction(
  reject: any,
  errorDetailCode: ChainErrorDetailCode,
  errorMessage: string,
  originalError: Error,
) {
  const error = new ChainError(ChainErrorType.TxConfirmFailure, errorMessage, { errorDetailCode }, originalError)
  reject(error)
}
