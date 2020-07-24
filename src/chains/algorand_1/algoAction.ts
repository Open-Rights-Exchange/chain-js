import * as algosdk from 'algosdk'
import { isNullOrEmpty, toBuffer, bufferToString } from '../../helpers'
import { throwNewError } from '../../errors'
import { AlgorandTxAction, AlgorandTxActionRaw } from './models/transactionModels'
import { AlgorandTxHeaderParams, AlgorandChainTransactionParamsStruct } from './models'
import { ALGORAND_TRX_COMFIRMATION_ROUNDS, ALGORAND_EMPTY_CONTRACT_NAME } from './algoConstants'
import { isAlgorandTxActionRaw, toAlgorandAddressFromRaw, toRawAddressFromAlgoAddr } from './helpers'

/** Helper class to ensure transaction actions properties are set correctly
 * Algorand supports these actions:
 * 1) Payment,
 * 2) Key Registration,
 * 3) Asset Configuration, // Asset creation also comes under this category
 * 4) Asset Freeze,
 * 5) Asset Transfer.
 * Helper class has the same variables initialised as the Algorand Transaction Builder Class
 * All the transaction types listed above have relevant variables initialised from the Algorand Transaction Builder Class
 * https://github.com/algorand/js-algorand-sdk/blob/develop/src/transaction.js
 */
export class AlgorandActionHelper {
  private _rawAction: AlgorandTxActionRaw

  /** Creates a new Action from a raw action (or Algrorand action replacing hexstrings for Uint8Arrays)
   *  .action property returns action with Uint8Arrays converted to hexstrings
   *  .raw property returns action which includes Uint8Arrays (used by chain) */
  constructor(params: AlgorandTxAction | AlgorandTxActionRaw) {
    this.validateAndApplyParams(params)
  }

  /** applies rules for input params, converts to raw values if needed */
  private validateAndApplyParams(action: AlgorandTxAction | AlgorandTxActionRaw) {
    if (isNullOrEmpty(action)) {
      throwNewError('Missing action')
    }
    if (isNullOrEmpty(action.from)) {
      throwNewError('Action requires a from value')
    }
    if (isAlgorandTxActionRaw(action)) {
      this._rawAction = action as AlgorandTxActionRaw
    } else {
      this._rawAction = this.actionToRaw(action as AlgorandTxAction)
    }
  }

  /** Action properties including raw data */
  public get raw(): AlgorandTxActionRaw {
    const rawParams = this._rawAction
    this.deleteEmptyFields(rawParams)
    return rawParams
  }

  /** Action properties with addresses converted to hexstrings (from Uint8Arrays) */
  public get action(): AlgorandTxAction {
    const returnVal = {
      ...this.raw,
      to: toAlgorandAddressFromRaw(this.raw.to),
      from: toAlgorandAddressFromRaw(this.raw.from),
      closeRemainderTo: toAlgorandAddressFromRaw(this.raw.closeRemainderTo),
      assetManager: toAlgorandAddressFromRaw(this.raw.assetManager),
      assetReserve: toAlgorandAddressFromRaw(this.raw.assetReserve),
      assetFreeze: toAlgorandAddressFromRaw(this.raw.assetFreeze),
      assetClawback: toAlgorandAddressFromRaw(this.raw.assetClawback),
      freezeAccount: toAlgorandAddressFromRaw(this.raw.freezeAccount),
      assetRevocationTarget: toAlgorandAddressFromRaw(this.raw.assetRevocationTarget),
      note: algosdk.decodeObj(this.raw.note),
      tag: bufferToString(this.raw.tag),
    }
    this.deleteEmptyFields(returnVal)
    return returnVal
  }

  /** Action properties formatted to send to algosdk - includes hexstring addresses and UInt8Array note */
  public get actionForChain(): AlgorandTxAction {
    const returnVal = this.action
    // encode for transaction siging
    if (this.action.note) {
      returnVal.note = algosdk.encodeObj(this.action.note)
    }
    return returnVal
  }

  /** Action properties with all UInt8Array fields converted to hex strings */
  private actionToRaw(action: AlgorandTxAction) {
    const raw: AlgorandTxActionRaw = {
      ...action,
      to: toRawAddressFromAlgoAddr(action.to) || undefined,
      from: toRawAddressFromAlgoAddr(action.from) || undefined,
      closeRemainderTo: toRawAddressFromAlgoAddr(action.closeRemainderTo) || undefined,
      assetManager: toRawAddressFromAlgoAddr(action.assetManager) || undefined,
      assetReserve: toRawAddressFromAlgoAddr(action.assetReserve) || undefined,
      assetFreeze: toRawAddressFromAlgoAddr(action.assetFreeze) || undefined,
      assetClawback: toRawAddressFromAlgoAddr(action.assetClawback) || undefined,
      freezeAccount: toRawAddressFromAlgoAddr(action.freezeAccount) || undefined,
      assetRevocationTarget: toRawAddressFromAlgoAddr(action.assetRevocationTarget) || undefined,
      note: algosdk.encodeObj(action.note),
      tag: toBuffer(action.tag),
    }
    return raw
  }

  /** Always returns 'none' for Algorand chain */
  public get contract(): string {
    return ALGORAND_EMPTY_CONTRACT_NAME
  }

  /** Transaction-specific properties - required for sending action to the chain */
  public get transactionHeaderParams(): AlgorandTxHeaderParams {
    return {
      genesisID: this.raw.genesisID,
      genesisHash: this.raw.genesisHash,
      firstRound: this.raw.firstRound,
      lastRound: this.raw.lastRound,
      fee: this.raw.fee,
      flatFee: this.raw.flatFee,
    }
  }

  /** Action properties - excludes 'suggestedParams' fields (e.g. genesisID) */
  public get paramsOnly() {
    const {
      fee: a,
      flatFee: b,
      firstRound: c,
      lastRound: d,
      genesisID: e,
      genesisHash: f,
      ...actionParams
    } = this.action
    // remove params that have empty values (undefined or null)
    this.deleteEmptyFields(actionParams)
    return actionParams
  }

  /** Adds the latest transaction header fields (firstRound, etc.) from chain
   *  Applies any that are not already provided in the action */
  applyCurrentTxHeaderParamsWhereNeeded(chainTxParams: AlgorandChainTransactionParamsStruct) {
    const rawAction = this.raw
    rawAction.genesisID = rawAction.genesisID || chainTxParams.genesisID
    rawAction.genesisHash = rawAction.genesisHash || chainTxParams.genesishashb64
    rawAction.firstRound = rawAction.firstRound || chainTxParams.lastRound // start with the most recent chain round (chainTxParams.lastRound)
    rawAction.lastRound = rawAction.lastRound || rawAction.firstRound + ALGORAND_TRX_COMFIRMATION_ROUNDS
    rawAction.fee = rawAction.flatFee === true ? rawAction.fee || chainTxParams.minFee : chainTxParams.minFee
    rawAction.flatFee = rawAction.flatFee || false
  }

  /** Remove fields from object that are undefined, null, or empty */
  deleteEmptyFields(paramsIn: { [key: string]: any }) {
    const params = paramsIn
    Object.keys(params).forEach(key => (isNullOrEmpty(params[key]) ? delete params[key] : {}))
    if (params.lease && (params.lease as Uint8Array).length === 0) delete params.lease
  }
}
