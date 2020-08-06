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

  return new ChainError(errorType, errorMessage, errorJson, error)
}

// main
const ERROR_MULTISIG_BAD_SENDER = new Error('The transaction sender address and multisig preimage do not match.')
const ERROR_INVALID_MICROALGOS = new Error('Microalgos should be positive and less than 2^53 - 1.')

// multisig
const ERROR_MULTISIG_MERGE_LESSTHANTWO = new Error('Not enough multisig transactions to merge. Need at least two')
const ERROR_MULTISIG_MERGE_MISMATCH = new Error('Cannot merge txs. txIDs differ')
const ERROR_MULTISIG_MERGE_WRONG_PREIMAGE = new Error('Cannot merge txs. Multisig preimages differ')
const ERROR_MULTISIG_MERGE_SIG_MISMATCH = new Error('Cannot merge txs. subsigs are mismatched.')
const ERROR_MULTISIG_BAD_FROM_FIELD = new Error('The transaction from field and multisig preimage do not match.')
const ERROR_MULTISIG_KEY_NOT_EXIST = new Error('Key does not exist')

// Bid
if (!Number.isSafeInteger(bidAmount) || bidAmount < 0) throw Error('Bid amount must be positive and 2^53-1')
if (!Number.isSafeInteger(bidID) || bidID < 0) throw Error('BidID must be positive and 2^53-1')
if (!Number.isSafeInteger(auctionID) || auctionID < 0) throw Error('auctionID must be positive')

// Sign
throw new Error('invalid secret key')
throw new Error('no multisig present')

// encoding
const MALFORMED_ADDRESS_ERROR = new Error('address seems to be malformed')
const INVALID_MSIG_VERSION = new Error('invalid multisig version')
const INVALID_MSIG_THRESHOLD = new Error('bad multisig threshold')
const INVALID_MSIG_PK = new Error('bad multisig public key - wrong length')
const UNEXPECTED_PK_LEN = new Error('nacl public key length is not 32 bytes')
const ERROR_CONTAINS_EMPTY = new Error("The object contains empty or 0 values");

//algod
*should be an integer");

// Transaction

if (lease.constructor !== Uint8Array) throw Error('lease must be a Uint8Array.')
if (lease.length !== ALGORAND_TRANSACTION_LEASE_LENGTH)
  throw Error(`lease must be of length ${ALGORAND_TRANSACTION_LEASE_LENGTH.toString()}.`)
if (note.constructor !== Uint8Array) throw Error('note must be a Uint8Array.')
const errorMsg = `${hashes.length.toString()} transactions grouped together but max group size is ${ALGORAND_MAX_TX_GROUP_SIZE.toString()}`
if (genesisHash === undefined) throw Error('genesis hash must be specified and in a base64 string.')
if (amount !== undefined && (!Number.isSafeInteger(amount) || amount < 0))
  throw Error('Amount must be a positive number and smaller than 2^53-1')
if (!Number.isSafeInteger(fee) || fee < 0) throw Error('fee must be a positive number and smaller than 2^53-1')
if (!Number.isSafeInteger(firstRound) || firstRound < 0) throw Error('firstRound must be a positive number')
if (!Number.isSafeInteger(lastRound) || lastRound < 0) throw Error('lastRound must be a positive number')
if (assetTotal !== undefined && (!Number.isSafeInteger(assetTotal) || assetTotal < 0))
  throw Error('Total asset issuance must be a positive number and smaller than 2^53-1')
if (
  assetDecimals !== undefined &&
  (!Number.isSafeInteger(assetDecimals) || assetDecimals < 0 || assetDecimals > ALGORAND_MAX_ASSET_DECIMALS)
)
  throw Error(`assetDecimals must be a positive number and smaller than ${ALGORAND_MAX_ASSET_DECIMALS.toString()}`)
if (assetIndex !== undefined && (!Number.isSafeInteger(assetIndex) || assetIndex < 0))
  throw Error('Asset index must be a positive number and smaller than 2^53-1')

// dynamicfee
if (!Number.isSafeInteger(amount) || amount < 0) throw Error('amount must be a positive number and smaller than 2^53-1')
if (!Number.isSafeInteger(firstValid) || firstValid < 0)
  throw Error('firstValid must be a positive number and smaller than 2^53-1')
if (!Number.isSafeInteger(lastValid) || lastValid < 0)
  throw Error('lastValid must be a positive number and smaller than 2^53-1')
throw new Error('invalid signature')
if (!Number.isSafeInteger(expiryRound) || expiryRound < 0)
  throw Error('expiryRound must be a positive number and smaller than 2^53-1')
if (!Number.isSafeInteger(maxFee) || maxFee < 0) throw Error('maxFee must be a positive number and smaller than 2^53-1')
throw Error('hash function unrecognized')
if (hashImageBytes.length !== 32) throw Error('hash image must be 32 bytes')
throw new Error('sha256 hash of preimage did not match stored contract hash')
throw new Error('keccak256 hash of preimage did not match stored contract hash')
throw new Error('hash function in contract unrecognized')
throw new Error(
  `final fee of payment transaction${tempTxn.fee.toString()}greater than transaction max fee${maxFee.toString()}`,
)

// limitorder
if (!Number.isSafeInteger(assetid) || assetid < 0)
  throw Error('assetid must be a positive number and smaller than 2^53-1')
if (!Number.isSafeInteger(ratn) || ratn < 0) throw Error('ratn must be a positive number and smaller than 2^53-1')
if (!Number.isSafeInteger(ratd) || ratd < 0) throw Error('ratd must be a positive number and smaller than 2^53-1')
if (!Number.isSafeInteger(expiryRound) || expiryRound < 0)
  throw Error('expiryRound must be a positive number and smaller than 2^53-1')
if (!Number.isSafeInteger(minTrade) || minTrade < 0)
  throw Error('minTrade must be a positive number and smaller than 2^53-1')
if (!Number.isSafeInteger(maxFee) || maxFee < 0) throw Error('maxFee must be a positive number and smaller than 2^53-1')
throw new Error(
  `bad payment ratio, ${assetAmount.toString()}*${ratd.toString()} !>= ${microAlgoAmount.toString()}*${ratn.toString()}`,
)
throw new Error(`payment amount ${microAlgoAmount.toString()} less than minimum trade ${minTrade.toString()}`)
throw new Error(
  `final fee of payment transaction ${txGroup[0].fee.toString()} greater than transaction max fee ${maxFee.toString()}`,
)
throw new Error(
  `final fee of asset transaction ${txGroup[1].fee.toString()} greater than transaction max fee ${maxFee.toString()}`,
)
if (!Number.isSafeInteger(amount) || amount < 0) throw Error('amount must be a positive number and smaller than 2^53-1')
if (!Number.isSafeInteger(withdrawalWindow) || withdrawalWindow < 0)
  throw Error('withdrawalWindow must be a positive number and smaller than 2^53-1')
if (!Number.isSafeInteger(period) || period < 0) throw Error('period must be a positive number and smaller than 2^53-1')
if (!Number.isSafeInteger(expiryRound) || expiryRound < 0)
  throw Error('expiryRound must be a positive number and smaller than 2^53-1')
if (!Number.isSafeInteger(maxFee) || maxFee < 0) throw Error('maxFee must be a positive number and smaller than 2^53-1')
