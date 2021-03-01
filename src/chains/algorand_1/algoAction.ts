import * as algosdk from 'algosdk'
import { Transaction as AlgoTransactionClass } from 'algosdk/src/transaction'
import {
  bigIntToUint8Array,
  bufferToString,
  byteArrayToHexString,
  ensureJsonArrayOfIntsConvertedToUInt8Array,
  hasHexPrefix,
  hexStringToByteArray,
  isAnObject,
  isANumber,
  isAString,
  isAUint8Array,
  isBase64Encoded,
  isHexString,
  isNullOrEmpty,
  removeHexPrefix,
  toBuffer,
} from '../../helpers'
import { throwNewError } from '../../errors'
import {
  AlgorandTxAction,
  AlgorandTxActionRaw,
  AlgorandTxActionSdkEncoded,
  AlgorandTxActionSdkEncodedFields,
} from './models/transactionModels'
import { AlgorandTxHeaderParams, AlgorandChainTransactionParamsStruct, AlgorandRawTransactionStruct } from './models'
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
  constructor(
    params: AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded | AlgorandRawTransactionStruct,
  ) {
    this.validateAndApplyParams(params)
  }

  /** applies rules for input params, converts to raw values if needed */
  private validateAndApplyParams(
    action: AlgorandTxAction | AlgorandTxActionRaw | AlgorandTxActionSdkEncoded | AlgorandRawTransactionStruct,
  ) {
    if (isNullOrEmpty(action)) {
      throwNewError('Missing action')
    }
    console.log('valudateand')
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
        ? byteArrayToHexString(this.raw.appApprovalProgram)
        : undefined,
      appClearProgram: !isNullOrEmpty(this.raw.appClearProgram)
        ? byteArrayToHexString(this.raw.appClearProgram)
        : undefined,
      // raw appArgs is an array of UInt8Array - since we cant know what type to decode it to, we convert each to a hexstring - with '0x' prefix for clarity
      appArgs: !isNullOrEmpty(this.raw.appArgs) ? this.decodeRawAppArgsToReadable(this.raw.appArgs) : undefined,
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
      appAccounts: !isNullOrEmpty(action.appAccounts) ? action.appAccounts.map(toRawAddressFromAlgoAddr) : undefined,
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
    return AlgoTransactionClass.from_obj_for_encoding(compressedTxn)
  }

  /** Always returns 'none' for Algorand chain */
  public get contract(): string {
    return ALGORAND_EMPTY_CONTRACT_NAME
  }

  /** Transaction-specific properties - required for sending action to the chain */
  public get transactionHeaderParams(): AlgorandTxHeaderParams {
    const header: AlgorandTxHeaderParams = {
      genesisID: this.raw.genesisID,
      genesisHash: bufferToString(this.raw.genesisHash, 'base64'),
      firstRound: this.raw.firstRound,
      lastRound: this.raw.lastRound,
    }
    if (!isNullOrEmpty(this.raw.fee)) header.fee = this.raw.fee
    if (!isNullOrEmpty(this.raw.flatFee)) header.flatFee = this.raw.flatFee
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
    if (!isNullOrEmpty(appArgs)) params.appArgs = this.encodeAppArgsToRaw(appArgs)
    if (!isNullOrEmpty(appApprovalProgram) && isHexString(appApprovalProgram)) {
      params.appApprovalProgram = hexStringToByteArray(appApprovalProgram)
    }
    if (!isNullOrEmpty(appClearProgram) && isHexString(appClearProgram)) {
      params.appClearProgram = hexStringToByteArray(appClearProgram)
    }
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
    rawAction.genesisHash = rawAction.genesisHash || toBuffer(chainTxParams.genesisHash, 'base64')
    rawAction.firstRound = rawAction.firstRound || chainTxParams.firstRound
    rawAction.lastRound = rawAction.lastRound || rawAction.firstRound + ALGORAND_TRX_COMFIRMATION_ROUNDS
    rawAction.fee = rawAction.fee || chainTxParams.minFee
    rawAction.flatFee = true // since we're setting a fee, this will always be true - flatFee is just a hint to the AlgoSDK.Tx object which will set its own fee if this is not true
  }

  /** Remove fields from object that are undefined, null, or empty */
  private deleteEmptyFields(paramsIn: { [key: string]: any }) {
    const params = paramsIn
    Object.keys(params).forEach(key => (isNullOrEmpty(params[key]) ? delete params[key] : {}))
  }

  /** whether action is the native chain 'raw' format */
  private isAlgorandTxAction(action: AlgorandTxAction | AlgorandTxActionRaw): boolean {
    return isAString(action.from)
  }

  private ensureBufferIsUint8Array(value: any) {
    if (isAnObject(value)) {
      if (value?.type === 'Buffer') {
        return value?.data as Uint8Array
      }
    }
    return ensureJsonArrayOfIntsConvertedToUInt8Array(value)
  }

  private ensureRawIsUint8Array(action: any) {
    const rawAction = action
    if (isAnObject(rawAction?.from)) {
      rawAction.from.publicKey = this.ensureBufferIsUint8Array(action?.from?.publicKey)
      rawAction.from.checksum = this.ensureBufferIsUint8Array(action?.from?.checksum)
    }
    if (rawAction?.to?.publicKey) {
      rawAction.to.publicKey = this.ensureBufferIsUint8Array(action?.to?.publicKey)
      rawAction.to.checksum = this.ensureBufferIsUint8Array(action?.to?.checksum)
    }
    rawAction.note = this.ensureBufferIsUint8Array(action?.note)
    rawAction.tag = this.ensureBufferIsUint8Array(action?.tag)
    rawAction.lease = this.ensureBufferIsUint8Array(action?.lease)
    if (rawAction?.closeRemainderTo) {
      rawAction.closeRemainderTo.publicKey = this.ensureBufferIsUint8Array(action?.closeRemainderTo?.publicKey)
      rawAction.closeRemainderTo.checksum = this.ensureBufferIsUint8Array(action?.closeRemainderTo?.checksum)
    }
    rawAction.voteKey = this.ensureBufferIsUint8Array(action?.voteKey)
    rawAction.selectionKey = this.ensureBufferIsUint8Array(action?.selectionKey)
    if (rawAction?.assetManager?.publicKey) {
      rawAction.assetManager.publicKey = this.ensureBufferIsUint8Array(action?.assetManager?.publicKey)
      rawAction.assetManager.checksum = this.ensureBufferIsUint8Array(action?.assetManager?.checksum)
    }
    if (rawAction?.assetReserve?.publicKey) {
      rawAction.assetReserve.publicKey = this.ensureBufferIsUint8Array(action?.assetReserve?.publicKey)
      rawAction.assetReserve.checksum = this.ensureBufferIsUint8Array(action?.assetReserve?.checksum)
    }
    if (rawAction?.assetFreeze?.publicKey) {
      rawAction.assetFreeze.publicKey = this.ensureBufferIsUint8Array(action?.assetFreeze?.publicKey)
      rawAction.assetFreeze.checksum = this.ensureBufferIsUint8Array(action?.assetFreeze?.checksum)
    }
    if (rawAction?.assetClawback?.publicKey) {
      rawAction.assetClawback.publicKey = this.ensureBufferIsUint8Array(action?.assetClawback?.publicKey)
      rawAction.assetClawback.checksum = this.ensureBufferIsUint8Array(action?.assetClawback?.checksum)
    }
    if (rawAction?.freezeAccount?.publicKey) {
      rawAction.freezeAccount.publicKey = this.ensureBufferIsUint8Array(action?.freezeAccount?.publicKey)
      rawAction.freezeAccount.checksum = this.ensureBufferIsUint8Array(action?.freezeAccount?.checksum)
    }
    if (rawAction?.assetRevocationTarget?.publicKey) {
      rawAction.assetRevocationTarget.publicKey = this.ensureBufferIsUint8Array(
        action?.assetRevocationTarget?.publicKey,
      )
      rawAction.assetRevocationTarget.checksum = this.ensureBufferIsUint8Array(action?.assetRevocationTarget?.checksum)
    }
    rawAction.group = this.ensureBufferIsUint8Array(action?.group)
    rawAction.appApprovalProgram = this.ensureBufferIsUint8Array(action?.appApprovalProgram)
    rawAction.appClearProgram = this.ensureBufferIsUint8Array(action?.appClearProgram)
    if (rawAction?.appArgs)
      rawAction.appArgs = action?.appArgs.map((appArg: any) => this.ensureBufferIsUint8Array(appArg))
    if (rawAction?.appAccounts?.length > 0 && rawAction?.appAccounts[0].publicKey)
      rawAction.appAccounts = action?.appAccounts.map((appAccount: any) => {
        return {
          publicKey: this.ensureBufferIsUint8Array(appAccount?.publicKey),
          checksum: this.ensureBufferIsUint8Array(appAccount?.checksum),
        }
      })
    if (isAnObject(rawAction?.reKeyTo)) {
      rawAction.reKeyTo.publicKey = this.ensureBufferIsUint8Array(action?.reKeyTo?.publicKey)
      rawAction.reKeyTo.checksum = this.ensureBufferIsUint8Array(action?.reKeyTo?.checksum)
    }
    rawAction.genesisHash = this.ensureBufferIsUint8Array(action?.genesisHash)
    // console.log('converted public key: ', rawAction?.from?.publicKey)
    // console.log('publickey hex: ', byteArrayToHexString(rawAction?.from?.publicKey))
    return rawAction
  }

  /** whether action is the native chain 'raw' format */
  private isAlgorandTxActionRaw(action: any): boolean {
    const rawAction = this.ensureRawIsUint8Array(action) as AlgorandTxActionRaw
    const hasPublicKey = rawAction.from?.publicKey
    return hasPublicKey && isAUint8Array(rawAction.from?.publicKey)
  }

  /** whether action is the native chain 'raw' and compressed format (get_obj_for_encoding) as defined here - https://github.com/algorand/js-algorand-sdk/blob/a5309ee57dddbf6f9db5f95dc8a82eb1ae03c326/src/transaction.js#L154 */
  private isAlgorandTxActionRawCompressed(action: any): boolean {
    return !!action?.txn?.snd
  }

  /** whether action is encoded for the algo sdk (from is string and note is UInt8Array) */
  private isAlgorandTxActionEncodedForSdk(action: any): boolean {
    return (
      !this.isAlgorandTxActionRaw(action) &&
      (isAUint8Array(action.appApprovalProgram) ||
        isAUint8Array(action.appClearProgram) ||
        isAUint8Array(action.note) ||
        isAUint8Array(action.lease) ||
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
      if (isAUint8Array(appArg)) return appArg as Uint8Array
      if (hasHexPrefix(appArg)) return new Uint8Array(Buffer.from(removeHexPrefix(appArg as string), 'hex'))
      if (isBase64Encoded(appArg)) return new Uint8Array(Buffer.from(appArg as string, 'base64'))
      if (isAString(appArg)) return new Uint8Array(Buffer.from(appArg as string, 'utf8'))
      if (isANumber(appArg)) return bigIntToUint8Array(appArg as number) // TODO: Confirm this is the right conversion - can we use an existing function for this?
      return undefined
    })
    return appArgsEncoded || []
  }

  /** Accepts encoded AppArgs - array of Uint8Array
   *  Converts to unencoded AppArgs - array of hex encoded strings (with '0x' prefix)
   */
  private decodeRawAppArgsToReadable(appArgs: Uint8Array[]): string[] {
    if (isNullOrEmpty(appArgs)) return undefined
    const readable: string[] = appArgs.map(arg => {
      if (isAUint8Array(arg)) {
        return `0x${Buffer.from(arg).toString('hex')}`
      }
      return undefined
    })
    return readable
  }
}
