/* eslint-disable @typescript-eslint/indent */
import * as algosdk from 'algosdk'
import { Transaction as AlgoTransactionClass } from 'algosdk'
import { Helpers, Errors } from '@open-rights-exchange/chainjs'
import {
  AlgorandTransactionOptions,
  AlgorandTxAction,
  AlgorandTxActionRaw,
  AlgorandTxActionSdkEncoded,
  AlgorandTxActionSdkEncodedFields,
} from './models/transactionModels'
import {
  AlgorandAddress,
  AlgorandChainTransactionParamsStruct,
  AlgorandRawTransactionMultisigStruct,
  AlgorandRawTransactionStruct,
  AlgorandTxHeaderParams,
} from './models'
import {
  ALGORAND_EMPTY_CONTRACT_NAME,
  ALGORAND_CHAIN_BLOCK_FREQUENCY,
  ALGORAND_DEFAULT_TRANSACTION_VALID_BLOCKS,
  MINIMUM_TRANSACTION_FEE_FALLBACK,
} from './algoConstants'
import { toAlgorandAddressFromRawStruct, toRawAddressFromAlgoAddr } from './helpers'

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
  constructor(
    params:
      | AlgorandTxAction
      | AlgorandTxActionRaw
      | AlgorandTxActionSdkEncoded
      | AlgorandRawTransactionStruct
      | AlgorandRawTransactionMultisigStruct
      | algosdk.Transaction,
  ) {
    this.validateAndApplyParams(params)
  }

  /** applies rules for input params, converts to raw values if needed */
  private validateAndApplyParams(
    actionParam:
      | AlgorandTxAction
      | AlgorandTxActionRaw
      | AlgorandTxActionSdkEncoded
      | AlgorandRawTransactionStruct
      | AlgorandRawTransactionMultisigStruct
      | algosdk.Transaction,
  ) {
    if (Helpers.isNullOrEmpty(actionParam)) {
      Errors.throwNewError('Missing action')
    }
    // Stringify & revive to reinstate Uint8Array objects
    const action = Helpers.jsonParseAndRevive(JSON.stringify(actionParam))
    // TODO Algo - consider if any validation here is needed - should probably check .from when getting action
    // We cant check for .from here since we want to use action helper to add header values to a partial action
    // if (isNullOrEmpty(action.from)) {
    //   throwNewError('Action requires a from value')
    // }
    if (this.isAlgorandTxActionEncodedForSdk(action)) {
      this._rawAction = this.actionEncodedForSdkToRaw(action as AlgorandTxActionSdkEncoded)
    } else if (this.isAlgorandTxActionRaw(action)) {
      this._rawAction = action as AlgorandTxActionRaw
    } else if (this.isAlgorandTxActionRawCompressed(action)) {
      this._rawAction = this.actionRawCompressedToRaw(action) as AlgorandTxActionRaw
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
      genesisHash: this.raw.genesisHash ? Helpers.bufferToString(this.raw.genesisHash, 'base64') : undefined,
      to: toAlgorandAddressFromRawStruct(this.raw.to),
      from: toAlgorandAddressFromRawStruct(this.raw.from),
      closeRemainderTo: toAlgorandAddressFromRawStruct(this.raw.closeRemainderTo),
      assetManager: toAlgorandAddressFromRawStruct(this.raw.assetManager),
      assetReserve: toAlgorandAddressFromRawStruct(this.raw.assetReserve),
      assetFreeze: toAlgorandAddressFromRawStruct(this.raw.assetFreeze),
      assetClawback: toAlgorandAddressFromRawStruct(this.raw.assetClawback),
      assetRevocationTarget: toAlgorandAddressFromRawStruct(this.raw.assetRevocationTarget),
      freezeAccount: toAlgorandAddressFromRawStruct(this.raw.freezeAccount),
      reKeyTo: toAlgorandAddressFromRawStruct(this.raw.reKeyTo),
      appAccounts: !Helpers.isNullOrEmpty(this.raw.appAccounts)
        ? this.raw.appAccounts.map(toAlgorandAddressFromRawStruct)
        : undefined,
      appApprovalProgram: !Helpers.isNullOrEmpty(this.raw.appApprovalProgram)
        ? Helpers.byteArrayToHexString(this.raw.appApprovalProgram)
        : undefined,
      appClearProgram: !Helpers.isNullOrEmpty(this.raw.appClearProgram)
        ? Helpers.byteArrayToHexString(this.raw.appClearProgram)
        : undefined,
      // raw appArgs is an array of UInt8Array - since we cant know what type to decode it to, we convert each to a hexstring - with '0x' prefix for clarity
      appArgs: !Helpers.isNullOrEmpty(this.raw.appArgs) ? this.decodeRawAppArgsToReadable(this.raw.appArgs) : undefined,
      group: this.raw.group ? Helpers.bufferToString(this.raw.group) : undefined,
      lease: !Helpers.isNullOrEmpty(this.raw.lease) ? (algosdk.decodeObj(this.raw.lease) as any) : undefined,
      note: !Helpers.isNullOrEmpty(this.raw.note) ? (algosdk.decodeObj(this.raw.note) as any) : undefined,
      selectionKey: this.raw.selectionKey ? Helpers.bufferToString(this.raw.selectionKey) : undefined,
      tag: this.raw.tag ? Helpers.bufferToString(this.raw.tag) : undefined,
      voteKey: this.raw.voteKey ? Helpers.bufferToString(this.raw.voteKey) : undefined,
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
      appAccounts: !Helpers.isNullOrEmpty(action.appAccounts)
        ? action.appAccounts.map(toRawAddressFromAlgoAddr)
        : undefined,
      assetManager: toRawAddressFromAlgoAddr(action.assetManager) || undefined,
      assetReserve: toRawAddressFromAlgoAddr(action.assetReserve) || undefined,
      assetFreeze: toRawAddressFromAlgoAddr(action.assetFreeze) || undefined,
      assetClawback: toRawAddressFromAlgoAddr(action.assetClawback) || undefined,
      assetRevocationTarget: toRawAddressFromAlgoAddr(action.assetRevocationTarget) || undefined,
      freezeAccount: toRawAddressFromAlgoAddr(action.freezeAccount) || undefined,
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
    const raw: AlgorandTxActionRaw = this.actionToRaw(otherParams as AlgorandTxAction)
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

  /** Convert raw, compressed format to our decompressed raw format */
  private actionRawCompressedToRaw(action: any) {
    const compressedTxn = action?.txn
    const rawTrx = AlgoTransactionClass.from_obj_for_encoding(compressedTxn)
    // CompressedTrx.fee is always flatFee but from_obj_for_encoding only converts fields.
    rawTrx.flatFee = true
    return rawTrx
  }

  /** Always returns 'none' for Algorand chain */
  public get contract(): string {
    return ALGORAND_EMPTY_CONTRACT_NAME
  }

  /** Transaction-specific properties - required for sending action to the chain */
  public get transactionHeaderParams(): AlgorandTxHeaderParams {
    const header: AlgorandTxHeaderParams = {
      genesisID: this.raw.genesisID,
      genesisHash: Helpers.bufferToString(this.raw.genesisHash, 'base64'),
      firstRound: this.raw.firstRound,
      lastRound: this.raw.lastRound,
    }
    if (!Helpers.isNullOrEmpty(this.raw.fee)) header.fee = this.raw.fee
    if (!Helpers.isNullOrEmpty(this.raw.flatFee)) header.flatFee = this.raw.flatFee
    return header
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
    const { appApprovalProgram, appArgs, appClearProgram, group, lease, note, selectionKey, tag, voteKey } = paramsIn
    const params: any = { ...paramsIn }
    if (!Helpers.isNullOrEmpty(appArgs)) params.appArgs = this.encodeAppArgsToRaw(appArgs)
    if (!Helpers.isNullOrEmpty(appApprovalProgram) && Helpers.isHexString(appApprovalProgram)) {
      params.appApprovalProgram = Helpers.hexStringToByteArray(appApprovalProgram)
    }
    if (!Helpers.isNullOrEmpty(appClearProgram) && Helpers.isHexString(appClearProgram)) {
      params.appClearProgram = Helpers.hexStringToByteArray(appClearProgram)
    }
    if (!Helpers.isNullOrEmpty(group) && !Buffer.isBuffer(group)) params.group = Helpers.toBuffer(group)
    if (!Helpers.isNullOrEmpty(lease) && !Helpers.isAUint8Array(lease)) params.lease = algosdk.encodeObj(lease)
    if (!Helpers.isNullOrEmpty(note) && !Helpers.isAUint8Array(note)) params.note = algosdk.encodeObj(note)
    if (!Helpers.isNullOrEmpty(selectionKey) && !Buffer.isBuffer(selectionKey))
      params.selectionKey = Helpers.toBuffer(selectionKey)
    if (!Helpers.isNullOrEmpty(tag) && !Buffer.isBuffer(tag)) params.tag = Helpers.toBuffer(tag)
    if (!Helpers.isNullOrEmpty(voteKey) && !Buffer.isBuffer(voteKey)) params.voteKey = Helpers.toBuffer(voteKey)
    return params
  }

  /** Adds the latest transaction header fields (firstRound, etc.) from chain
   *  Applies any that are not already provided in the action */
  applyCurrentTxHeaderParamsWhereNeeded(
    chainTxParams: AlgorandChainTransactionParamsStruct,
    transactionOptions?: AlgorandTransactionOptions,
  ) {
    const rawAction = this.raw
    rawAction.genesisID = rawAction.genesisID || chainTxParams.genesisID
    rawAction.genesisHash = rawAction.genesisHash || Helpers.toBuffer(chainTxParams.genesisHash, 'base64')
    rawAction.fee = rawAction.fee || chainTxParams.minFee || MINIMUM_TRANSACTION_FEE_FALLBACK
    rawAction.flatFee = true // since we're setting a fee, this will always be true - flatFee is just a hint to the AlgoSDK.Tx object which will set its own fee if this is not true
    // if firstRound and/or lastRound are missing, set them
    if (!rawAction?.firstRound && !rawAction?.lastRound) {
      // if expireSeconds options is provided, override firstRound and lastRound
      if ((transactionOptions?.expireSeconds || 0) > 0) {
        // adjust last block to be expireSeconds from now - first block will be ALGORAND_DEFAULT_TRANSACTION_VALID_BLOCKS before the last block (e.g. 1000)
        rawAction.lastRound =
          chainTxParams.firstRound + Math.floor(transactionOptions?.expireSeconds / ALGORAND_CHAIN_BLOCK_FREQUENCY)
        // we'll set first round 1000 before the last round - unless the current round is higher, in which case, use the current round
        rawAction.firstRound = Math.max(
          chainTxParams.firstRound,
          rawAction.lastRound - ALGORAND_DEFAULT_TRANSACTION_VALID_BLOCKS,
        )
      } else {
        rawAction.firstRound = rawAction.firstRound || chainTxParams.firstRound
        rawAction.lastRound = rawAction.lastRound || rawAction.firstRound + ALGORAND_DEFAULT_TRANSACTION_VALID_BLOCKS // always replace the lastblock with default (or provided options)
      }
    }
  }

  /** Remove fields from object that are undefined, null, or empty */
  private deleteEmptyFields(paramsIn: { [key: string]: any }) {
    const params = paramsIn
    Object.keys(params).forEach(key => (Helpers.isNullOrEmpty(params[key]) ? delete params[key] : {}))
  }

  /** whether action is the native chain 'raw' format */
  private isAlgorandTxAction(action: AlgorandTxAction | AlgorandTxActionRaw): boolean {
    return Helpers.isAString(action.from)
  }

  /** whether action is the native chain 'raw' format */
  private isAlgorandTxActionRaw(action: any): boolean {
    const rawAction = action as AlgorandTxActionRaw
    const hasPublicKey = rawAction.from?.publicKey
    return hasPublicKey && Helpers.isAUint8Array(rawAction.from?.publicKey)
  }

  /** whether action is the native chain 'raw' and compressed format (get_obj_for_encoding) as defined here - https://github.com/algorand/js-algorand-sdk/blob/a5309ee57dddbf6f9db5f95dc8a82eb1ae03c326/src/transaction.js#L154 */
  private isAlgorandTxActionRawCompressed(action: any): boolean {
    return !!action?.txn?.snd
  }

  /** whether action is encoded for the algo sdk (from is string and note is UInt8Array) */
  private isAlgorandTxActionEncodedForSdk(action: any): boolean {
    return (
      !this.isAlgorandTxActionRaw(action) &&
      (Helpers.isAUint8Array(action.appApprovalProgram) ||
        Helpers.isAUint8Array(action.appClearProgram) ||
        Helpers.isAUint8Array(action.note) ||
        Helpers.isAUint8Array(action.lease) ||
        Buffer.isBuffer(action.group) ||
        Buffer.isBuffer(action.selectionKey) ||
        Buffer.isBuffer(action.tag) ||
        Buffer.isBuffer(action.voteKey))
    )
  }

  /** Accepts encoded or unencoded AppArgs array
   *  Converts to encoded AppArgs - array of Uint8Array
   */
  private encodeAppArgsToRaw(appArgs: (string | number | Uint8Array)[]): Uint8Array[] {
    if (!appArgs) return []
    const appArgsEncoded = appArgs.map((appArg: string | number | Uint8Array) => {
      if (Helpers.isAUint8Array(appArg)) return appArg as Uint8Array
      if (Helpers.hasHexPrefix(appArg))
        return new Uint8Array(Buffer.from(Helpers.removeHexPrefix(appArg as string), 'hex'))
      if (Helpers.isBase64EncodedAndNotUtf(appArg)) return new Uint8Array(Buffer.from(appArg as string, 'base64'))
      if (Helpers.isAString(appArg)) return new Uint8Array(Buffer.from(appArg as string, 'utf8'))
      if (Helpers.isANumber(appArg)) return Helpers.bigIntToUint8Array(appArg as number) // TODO: Confirm this is the right conversion - can we use an existing function for this?
      return undefined
    })
    return appArgsEncoded || []
  }

  /** Accepts encoded AppArgs - array of Uint8Array
   *  Converts to unencoded AppArgs - array of hex encoded strings (with '0x' prefix)
   */
  private decodeRawAppArgsToReadable(appArgs: Uint8Array[]): string[] {
    if (Helpers.isNullOrEmpty(appArgs)) return undefined
    const readable: string[] = appArgs.map(arg => {
      if (Helpers.isAUint8Array(arg)) {
        return `0x${Buffer.from(arg).toString('hex')}`
      }
      return undefined
    })
    return readable
  }

  /** Returns the 'from' or 'snd' address for the transaction */
  get from(): AlgorandAddress {
    if (Helpers.isNullOrEmpty(this.raw.from)) return null
    return toAlgorandAddressFromRawStruct(this.raw.from)
  }
}
