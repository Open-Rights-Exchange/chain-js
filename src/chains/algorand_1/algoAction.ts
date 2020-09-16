import * as algosdk from 'algosdk'
import { isNullOrEmpty, toBuffer, bufferToString, isAUint8Array, isAString, isAUint8ArrayArray } from '../../helpers'
import { throwNewError } from '../../errors'
import {
  AlgorandTxAction,
  AlgorandTxActionRaw,
  AlgorandTxActionSdkEncoded,
  AlgorandTxActionSdkEncodedFields,
} from './models/transactionModels'
import { AlgorandTxHeaderParams, AlgorandChainTransactionParamsStruct } from './models'
import { ALGORAND_TRX_COMFIRMATION_ROUNDS, ALGORAND_EMPTY_CONTRACT_NAME } from './algoConstants'
import { toAlgorandAddressFromRaw, toRawAddressFromAlgoAddr } from './helpers'

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
  constructor(params: AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded) {
    this.validateAndApplyParams(params)
  }

  /** applies rules for input params, converts to raw values if needed */
  private validateAndApplyParams(action: AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded) {
    if (isNullOrEmpty(action)) {
      throwNewError('Missing action')
    }
    // TODO Algo - consider if any validation here is needed - should probably check .from when getting action
    // We cant check for .from here since we want to use action helper to add header values to a partial action
    // if (isNullOrEmpty(action.from)) {
    //   throwNewError('Action requires a from value')
    // }
    if (this.isAlgorandTxActionEncodedForSdk(action)) {
      this._rawAction = this.actionEncodedForSdkToRaw(action as AlgorandTxActionSdkEncoded)
    } else if (this.isAlgorandTxActionRaw(action)) {
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
      genesisHash: this.raw.genesisHash ? bufferToString(this.raw.genesisHash, 'base64') : undefined,
      to: toAlgorandAddressFromRaw(this.raw.to),
      from: toAlgorandAddressFromRaw(this.raw.from),
      closeRemainderTo: toAlgorandAddressFromRaw(this.raw.closeRemainderTo),
      assetManager: toAlgorandAddressFromRaw(this.raw.assetManager),
      assetReserve: toAlgorandAddressFromRaw(this.raw.assetReserve),
      assetFreeze: toAlgorandAddressFromRaw(this.raw.assetFreeze),
      assetClawback: toAlgorandAddressFromRaw(this.raw.assetClawback),
      assetRevocationTarget: toAlgorandAddressFromRaw(this.raw.assetRevocationTarget),
      freezeAccount: toAlgorandAddressFromRaw(this.raw.freezeAccount),
      reKeyTo: toAlgorandAddressFromRaw(this.raw.reKeyTo),
      appAccounts: !isNullOrEmpty(this.raw.appAccounts)
        ? this.raw.appAccounts.map(toAlgorandAddressFromRaw)
        : undefined,
      appApprovalProgram: !isNullOrEmpty(this.raw.appApprovalProgram)
        ? algosdk.decodeObj(this.raw.appApprovalProgram)
        : undefined,
      appClearProgram: !isNullOrEmpty(this.raw.appClearProgram)
        ? algosdk.decodeObj(this.raw.appClearProgram)
        : undefined,
      appArgs: !isNullOrEmpty(this.raw.appArgs) ? (this.raw.appArgs.map(algosdk.decodeObj) as string[]) : undefined,
      group: this.raw.group ? bufferToString(this.raw.group) : undefined,
      lease: !isNullOrEmpty(this.raw.lease) ? algosdk.decodeObj(this.raw.lease) : undefined,
      note: !isNullOrEmpty(this.raw.note) ? algosdk.decodeObj(this.raw.note) : undefined,
      selectionKey: this.raw.selectionKey ? bufferToString(this.raw.selectionKey) : undefined,
      tag: this.raw.tag ? bufferToString(this.raw.tag) : undefined,
      voteKey: this.raw.voteKey ? bufferToString(this.raw.voteKey) : undefined,
    }
    this.deleteEmptyFields(returnVal)
    return returnVal
  }

  /** Action properties formatted to send to algosdk - includes hexstring addresses and UInt8Array note */
  public get actionEncodedForSdk(): AlgorandTxActionSdkEncoded {
    let convertedParams: AlgorandTxActionSdkEncoded = {}
    // encode fields as required by SDK
    convertedParams = this.encodeFieldsForSdk(this.action)
    return convertedParams
  }

  /** Action properties with all UInt8Array fields converted to hex strings */
  private actionToRaw(action: AlgorandTxAction) {
    const rawSdkEncoded = this.encodeFieldsForSdk(action)
    const raw: AlgorandTxActionRaw = {
      ...rawSdkEncoded,
      to: toRawAddressFromAlgoAddr(action.to) || undefined,
      from: toRawAddressFromAlgoAddr(action.from) || undefined,
      closeRemainderTo: toRawAddressFromAlgoAddr(action.closeRemainderTo) || undefined,
      assetManager: toRawAddressFromAlgoAddr(action.assetManager) || undefined,
      assetReserve: toRawAddressFromAlgoAddr(action.assetReserve) || undefined,
      assetFreeze: toRawAddressFromAlgoAddr(action.assetFreeze) || undefined,
      assetClawback: toRawAddressFromAlgoAddr(action.assetClawback) || undefined,
      assetRevocationTarget: toRawAddressFromAlgoAddr(action.assetRevocationTarget) || undefined,
      freezeAccount: toRawAddressFromAlgoAddr(action.freezeAccount) || undefined,
      appAccounts: !isNullOrEmpty(action.appAccounts) ? action.appAccounts.map(toRawAddressFromAlgoAddr) : undefined,
      reKeyTo: toRawAddressFromAlgoAddr(action.reKeyTo) || undefined,
    }
    return raw
  }

  /** Convert Action encoded for algo sdk to raw - */
  private actionEncodedForSdkToRaw(action: AlgorandTxActionSdkEncoded) {
    const {
      appApprovalProgram,
      appArgs,
      appClearProgram,
      group,
      lease,
      note,
      selectionKey,
      tag,
      voteKey,
      ...otherParams
    }: AlgorandTxActionSdkEncodedFields & { otherParams?: any } = action
    const raw: AlgorandTxActionRaw = this.actionToRaw(otherParams as AlgorandTxAction) as AlgorandTxActionRaw
    // these fields are already encoded as needed for raw - so we dont want them encoded again
    raw.appApprovalProgram = appApprovalProgram
    raw.appArgs = appArgs
    raw.appClearProgram = appClearProgram
    raw.group = group
    raw.lease = lease
    raw.note = note
    raw.selectionKey = selectionKey
    raw.tag = tag
    raw.voteKey = voteKey
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
      genesisHash: bufferToString(this.raw.genesisHash, 'base64'),
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

  /** Action properties - excludes 'suggestedParams' fields (e.g. genesisID)
   *  Selected fields encoded (e.g. note) as required by algo sdk */
  public get paramsOnlySdkEncoded() {
    const actionParams = this.paramsOnly
    return this.encodeFieldsForSdk(actionParams)
  }

  /** Encode selected fields required by algo sdk */
  private encodeFieldsForSdk(paramsIn: any) {
    const { appApprovalProgram, appClearProgram, appArgs, group, lease, note, selectionKey, tag, voteKey } = paramsIn
    const params: any = { ...paramsIn }
    if (!isNullOrEmpty(appApprovalProgram) && !isAUint8Array(appApprovalProgram))
      params.appApprovalProgram = algosdk.encodeObj(appApprovalProgram)
    if (!isNullOrEmpty(appClearProgram) && !isAUint8Array(appClearProgram))
      params.appClearProgram = algosdk.encodeObj(appClearProgram)
    if (!isNullOrEmpty(appArgs) && !isAUint8ArrayArray(appArgs))
      params.appArgs = appArgs.map(algosdk.encodeObj(appArgs)) as Uint8Array[] // Array of UInt8Array
    if (!isNullOrEmpty(group) && !Buffer.isBuffer(group)) params.group = toBuffer(group)
    if (!isNullOrEmpty(lease) && !isAUint8Array(lease)) params.lease = algosdk.encodeObj(lease)
    if (!isNullOrEmpty(note) && !isAUint8Array(note)) params.note = algosdk.encodeObj(note)
    if (!isNullOrEmpty(selectionKey) && !Buffer.isBuffer(selectionKey)) params.selectionKey = toBuffer(selectionKey)
    if (!isNullOrEmpty(tag) && !Buffer.isBuffer(tag)) params.tag = toBuffer(tag)
    if (!isNullOrEmpty(voteKey) && !Buffer.isBuffer(voteKey)) params.voteKey = toBuffer(voteKey)
    return params
  }

  /** Adds the latest transaction header fields (firstRound, etc.) from chain
   *  Applies any that are not already provided in the action */
  applyCurrentTxHeaderParamsWhereNeeded(chainTxParams: AlgorandChainTransactionParamsStruct) {
    const rawAction = this.raw
    rawAction.genesisID = rawAction.genesisID || chainTxParams.genesisID
    rawAction.genesisHash = rawAction.genesisHash || toBuffer(chainTxParams.genesishashb64, 'base64')
    rawAction.firstRound = rawAction.firstRound || chainTxParams.lastRound // start with the most recent chain round (chainTxParams.lastRound)
    rawAction.lastRound = rawAction.lastRound || rawAction.firstRound + ALGORAND_TRX_COMFIRMATION_ROUNDS
    rawAction.fee = rawAction.flatFee === true ? rawAction.fee || chainTxParams.minFee : chainTxParams.minFee
    rawAction.flatFee = rawAction.flatFee || false
  }

  /** Remove fields from object that are undefined, null, or empty */
  deleteEmptyFields(paramsIn: { [key: string]: any }) {
    const params = paramsIn
    Object.keys(params).forEach(key => (isNullOrEmpty(params[key]) ? delete params[key] : {}))
    if (isAUint8ArrayArray(params.appArgs) && (params.appArgs as Uint8Array[]).length === 0) delete params.appArgs
  }

  /** whether action is the native chain 'raw' format */
  isAlgorandTxAction(action: AlgorandTxAction | AlgorandTxActionRaw): boolean {
    return isAString(action.from)
  }

  /** whether action is the native chain 'raw' format */
  isAlgorandTxActionRaw(action: AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded): boolean {
    const rawAction = action as AlgorandTxActionRaw
    const hasPublicKey = rawAction.from?.publicKey
    return hasPublicKey && isAUint8Array(rawAction.from?.publicKey)
  }

  /** whether action is encoded for the algo sdk (from is string and note is UInt8Array) */
  isAlgorandTxActionEncodedForSdk(
    action: AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded,
  ): boolean {
    return (
      (isAString(action.from) || isNullOrEmpty(action.from)) &&
      (isAUint8Array(action.appApprovalProgram) ||
        isAUint8Array(action.appClearProgram) ||
        isAUint8ArrayArray(action.appArgs) ||
        isAUint8Array(action.note) ||
        isAUint8Array(action.lease) ||
        Buffer.isBuffer(action.group) ||
        Buffer.isBuffer(action.selectionKey) ||
        Buffer.isBuffer(action.tag) ||
        Buffer.isBuffer(action.voteKey))
    )
  }
}
