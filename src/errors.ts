import { stringifySafe } from './helpers'
import { ChainErrorType } from './models'

/** Hold additional info related to the chain error
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
