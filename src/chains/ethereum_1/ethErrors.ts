/* eslint-disable no-restricted-syntax */
import { ChainError } from '../../errors'
import { stringifySafe } from '../../helpers'
import { ChainErrorType } from '../../models'

// subset of errors from Eteherum chain - {url to ETh errors}
// IMPORTANT: These are in order of importance
// ... keep the Misc.. errors at the bottom - they catch the categories if not caught by a more specific error higher up
export const ChainErrorRegExs: { [key: string]: string } = {
  UnknownError: '(.*)', // matches anything - this is the catch all if nothing else matches
}

// Maps an Error object (thrown by a call to the chain) into a known set of errors
export function mapChainError(error: Error): ChainError {
  let errorSearchString
  let errorMessage
  let errorJson
  let errorType = ChainErrorType.UnknownError

  if (error instanceof Error) {
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
      errorType = (ChainErrorType as any)[errorKey] // map the key name to an enum with the same name (e.g. MiscChainError)
      break
    }
  }

  return new ChainError(errorType, errorMessage, errorJson)
}
