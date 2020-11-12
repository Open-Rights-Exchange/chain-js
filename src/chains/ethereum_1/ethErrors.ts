/* eslint-disable no-restricted-syntax */
import { ChainError } from '../../errors'
import { stringifySafe } from '../../helpers'
import { ChainErrorType } from '../../models'
import { ChainFunctionCategory } from './models'

// subset of errors from Eteherum chain - {url to ETh errors}
// IMPORTANT: These are in order of importance
// ... keep the Misc.. errors at the bottom - they catch the categories if not caught by a more specific error higher up
export const DefaultChainErrorRegExs: { [key: string]: string } = {
  AuthInvalid: '(invalid transaction v, r, s values|public key|private key|invalid signature|signing failed)', // the permission isnt valid (or permission already exists in an account)
  BlockDoesNotExist: '(does not exist|header for hash not found|neither block nor hash specified)',
  DataReadFailedKeyDoesNotExist: 'not found',
  TxExceededResources: '(insufficient funds|insufficient balance)', // insufficient funds for gas * price + value
  // catch-all errors for a category
  MiscTransactionError:
    '(gas limit|nonce too high|nonce too low|already known|invalid sender|transaction underpriced|gas too low|negative value|oversized data|txdata|for signer|execution timeout)',
  MiscDatabaseError: 'index out of bounds',
  UnknownError: '(.*)', // matches anything - this is the catch all if nothing else matches
}

// Match messages for each type of error category
// Some errors have the same message thrown by the chain (e.g. 'not found') - diff meaning for each 'category' of errors
export const BlockErrorRegExs: { [key: string]: string } = {
  BlockDoesNotExist: '(not found|does not exist)',
  MiscBlockError: '(.*)', // matches anything - this is the catch all if nothing else matches
}

export const ChainStateErrorRegExs: { [key: string]: string } = {
  ChainStateDoesNotExist: 'not found',
  MiscChainStateError: '(.*)', // matches anything - this is the catch all if nothing else matches
}

export const ContractErrorRegExs: { [key: string]: string } = {
  ContractDoesNotExist: 'not found',
  MiscContractError: '(.*)', // matches anything - this is the catch all if nothing else matches
}

export const TransactionErrorRegExs: { [key: string]: string } = {
  TxExceededResources: DefaultChainErrorRegExs.TxExceededResources, // insufficient funds for gas * price + value
  TxNotFoundOnChain: 'xxx ToDo xxx',
  TransactionDoesNotExist: 'not found',
  MiscTransactionError: '(.*)', // matches anything - this is the catch all if nothing else matches
}

/** Maps a category of errors to a regex collection */
export const ChainFunctionCategoryMap: { [key: string]: any } = {
  Block: BlockErrorRegExs,
  ChainState: ChainStateErrorRegExs,
  Contract: ContractErrorRegExs,
  Transaction: TransactionErrorRegExs,
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

  return new ChainError(errorType, errorMessage, errorJson, error)
}
