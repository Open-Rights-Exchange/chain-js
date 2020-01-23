import { stringifySafe } from './helpers'
import { ChainErrorType } from './models'

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
