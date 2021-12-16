/* eslint-disable no-useless-escape */
/* eslint-disable no-restricted-syntax */
// import { RpcError } from 'eosjs'
// import { ChainError } from '../../errors'
// import { stringifySafe } from '../../helpers'
// import { ChainErrorType } from '../../models'
import { Models, Helpers, Errors } from '@open-rights-exchange/chainjs'

/**  subset of errors from EOS chain - https://github.com/EOSIO/eos/blob/master/libraries/chain/include/eosio/chain/exceptions.hpp
 * IMPORTANT: These are in order of importance
 * ... keep the Misc.. errors at the bottom - they catch the categories if not caught by a more specific error higher up */
export const ChainErrorRegExs: { [key: string]: string } = {
  AccountCreationFailedAlreadyExists: '(insert account|could not query|account raw data|error decoding account)',
  AccountDoesntExist: 'unknown account', // the account not on chain. Thrown by functions like link permission. Not thrown by get_account which throws
  AuthInvalid:
    '(Sig or Msig|mystery sig|LogicSig not enabled|LogicSig.Logic too|LogicSig.Logic version|LogicSig.Logic bad|one of sig or msig)', // the permission isnt valid (or permission already exists in an account)
  AuthUnsatisfied: '(signature validation|multisig validation|signed and not a Logic-only)', // all permission or keys needed for transaction weren't provided
  AuthMissing: '(no sig|LogicSig.Logic empty)', // missing permission or key
  BlockDoesNotExist:
    '((?=failed to retrieve)(.*)(?=block/[0-9]+)(.*)|no blocks|previous block|block round|block branch|MakeBlock|unrecognized blockhash|Too Many Requests|looking up block for round)',
  DataReadFailedKeyDoesNotExist: 'key does not exist',
  TokenBalanceTooLow: 'overflowed account balance|overspend',
  // TxConfirmFailure: 'TxConfirmFailure', UnmarshalMsg
  TxExceededResources: 'exceeds balance',
  TxFeeTooLow: 'fees, which is less than the minimum',
  TxNotFoundOnChain: 'no transaction found for transaction id|find the required transaction in the required range',
  MiscChainError: 'chain_type_exception',
  MiscBlockValidationError: '(GenesisHash mismatch|GenesisHash required|GenesisID mismatch)',
  MiscTransactionError:
    '(tx does not|unknown consensus|rejected by logic|asset transaction|transaction (asset|from|cannot|invalid|note|tried|has|window|tries|had|pool)|TransactionPool|(remember|malformed|invlid) tx|transaction already|ps2/v2/transaction)',
  MiscActionValidationError:
    '(address|nonempty AuthAddr|cannot close account|cannot spend from fee sink|cannot close fee sink|tx.|invalid application|programs|application|asset (name|metadata|unit|decimal|url))',
  MiscContractError: 'condition violated',
  MiscDatabaseError: 'database',
  MiscBlockProducerError: '(generate block|applyUpgradeVote|write block|block number already)',
  MiscNodeError: '(malformed|AlgorandFullNode|algod|Indexer|Unmarshall|agreementLedger)',
  UnknownError: '(.*)', // matches anything - this is the catch all if nothing else matches
}

/**  Maps an Error object (thrown by a call to the chain) into a known set of errors
 *   RpcError is an eosjs structure that includes the 'json' property that has error details */
// export function mapChainError(error: RpcError | Error): ChainError {
export function mapChainError(error: Error): Errors.ChainError {
  let errorSearchString
  let errorMessage
  let errorJson
  let errorType = Models.ChainErrorType.UnknownError

  // if (error instanceof RpcError) {
  //   errorSearchString = `${error.name} ${error.message} ${stringifySafe(error.json)}` // includes the full body of the response from the HTTP request to the chain
  //   errorMessage = `${stringifySafe(error.json)}`
  //   errorJson = error.json
  // } else if (error instanceof Error) {
  if (error instanceof Error) {
    errorSearchString = `${Helpers.stringifySafe(error)}`
    errorMessage = errorSearchString
  } else {
    errorSearchString = Helpers.stringifySafe(error)
    errorMessage = errorSearchString
  }

  // loop through all possible ChainErrors and compare error string to regex for each ChainError
  // exit on first match - if no match for known errors, will match on the last one - UnkownError
  for (const errorKey of Object.keys(ChainErrorRegExs)) {
    const regexp = new RegExp(ChainErrorRegExs[errorKey], 'im')
    const match = regexp.exec(errorSearchString)
    if (match) {
      // map the key name of the regEx to the ChainErrorType enum
      errorType = (Models.ChainErrorType as any)[errorKey] // map the key name to an enum with the same name (e.g. MiscChainError)
      break
    }
  }

  return new Errors.ChainError(errorType, errorMessage, errorJson, error)
}
