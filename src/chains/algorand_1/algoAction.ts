import { isNullOrEmpty, notImplemented } from '../../helpers'
import { throwNewError } from '../../errors'
import { AlgorandAddress } from './models/cryptoModels'
import { AlgorandValue } from './models/generalModels'
import { AlgorandTransactionAction } from './models/transactionModels'

/** Helper class to ensure transaction actions properties are set correctly */
export class AlgorandActionHelper {
  private _to: AlgorandAddress

  private _amount: AlgorandValue

  private _from: AlgorandAddress

  private _note: AlgorandValue

  private _name: string

  private _tag: Buffer

  private _lease: Uint8Array[]

  private _closeRemainderTo: AlgorandValue

  private _voteKey: AlgorandValue

  private _selectionKey: AlgorandValue

  private _voteFirst: AlgorandValue

  private _voteLast: AlgorandValue

  private _voteKeyDilution: AlgorandValue

  private _assetIndex: AlgorandValue

  private _assetTotal: AlgorandValue

  private _assetDecimals: AlgorandValue

  private _assetDefaultFrozen: AlgorandValue

  private _assetManager: AlgorandValue

  private _assetReserve: AlgorandValue

  private _assetFreeze: AlgorandValue

  private _assetClawback: AlgorandValue

  private _assetUnitName: AlgorandValue

  private _assetName: AlgorandValue

  private _assetURL: AlgorandValue

  private _assetMetadataHash: AlgorandValue

  private _assetRevocationTarget: AlgorandValue

  private _freezeAccount: AlgorandValue

  private _freezeState: AlgorandValue

  private _type: AlgorandValue

  private _group: AlgorandValue

  private _genesisID: AlgorandValue

  private _genesisHash: AlgorandValue

  private _firstRound: number

  private _lastRound: number

  private _fee: AlgorandValue

  private _flatFee: boolean

  /** Creates a new Action from 'human-readable' transfer or contact info
   *  OR from 'raw' data property
   *  Allows access to human-readable properties (method, parameters) or raw data (hex) */
  constructor(actionInput: AlgorandTransactionAction) {
    this.assertAndValidateAlgorandActionInput(actionInput)
  }

  /** apply rules for imput params, set class private properties, throw if violation */
  // ALGO TODO: add more validators to the function
  private assertAndValidateAlgorandActionInput(actionInput: AlgorandTransactionAction) {
    if (isNullOrEmpty(actionInput)) {
      throwNewError('Missing action')
    }
    const {
      to,
      from,
      amount,
      note,
      name,
      tag,
      lease,
      closeRemainderTo,
      voteKey,
      selectionKey,
      voteFirst,
      voteLast,
      voteKeyDilution,
      assetIndex,
      assetManager,
      assetTotal,
      assetDecimals,
      assetDefaultFrozen,
      assetMetadataHash,
      assetReserve,
      assetFreeze,
      assetClawback,
      assetUnitName,
      assetName,
      assetURL,
      freezeAccount,
      freezeState,
      assetRevocationTarget,
      type,
      group,
      genesisID,
      genesisHash,
      firstRound,
      lastRound,
      fee,
      flatFee,
    } = actionInput

    this._to = to
    this._from = from
    this._amount = amount
    this._note = note
    this._name = name
    this._tag = tag
    this._lease = lease
    this._closeRemainderTo = closeRemainderTo
    this._voteKey = voteKey
    this._selectionKey = selectionKey
    this._voteFirst = voteFirst
    this._voteLast = voteLast
    this._voteKeyDilution = voteKeyDilution
    this._assetIndex = assetIndex
    this._assetTotal = assetTotal
    this._assetDecimals = assetDecimals
    this._assetDefaultFrozen = assetDefaultFrozen
    this._assetManager = assetManager
    this._assetReserve = assetReserve
    this._assetFreeze = assetFreeze
    this._assetClawback = assetClawback
    this._assetUnitName = assetUnitName
    this._assetName = assetName
    this._assetURL = assetURL
    this._assetMetadataHash = assetMetadataHash
    this._freezeAccount = freezeAccount
    this._freezeState = freezeState
    this._assetRevocationTarget = assetRevocationTarget
    this._type = type
    this._group = group

    this._genesisID = genesisID
    this._genesisHash = genesisHash
    this._firstRound = firstRound
    this._lastRound = lastRound

    this._fee = fee
    this._flatFee = flatFee
  }

  /** Returns 'hex or binary' data */
  get data() {
    return notImplemented()
  }

  /** Checks is data value is empty or implying 0 */
  get hasData(): boolean {
    return notImplemented()
  }

  /** Action properties including raw data */
  public get raw(): AlgorandTransactionAction {
    return {
      to: this._to,
      from: this._from,
      amount: this._amount,
      note: this._note,
      name: this._name,
      tag: this._tag,
      lease: this._lease.length === 0 ? undefined : this._lease,
      closeRemainderTo: this._closeRemainderTo,
      voteKey: this._voteKey,
      selectionKey: this._selectionKey,
      voteFirst: this._voteFirst,
      voteLast: this._voteLast,
      voteKeyDilution: this._voteKeyDilution,
      assetIndex: this._assetIndex,
      assetManager: this._assetManager,
      assetTotal: this._assetTotal,
      assetDecimals: this._assetDecimals,
      assetDefaultFrozen: this._assetDefaultFrozen,
      assetMetadataHash: this._assetMetadataHash,
      assetReserve: this._assetReserve,
      assetFreeze: this._assetFreeze,
      assetClawback: this._assetClawback,
      assetUnitName: this._assetUnitName,
      assetName: this._assetName,
      assetURL: this._assetURL,
      freezeAccount: this._freezeAccount,
      freezeState: this._freezeState,
      assetRevocationTarget: this._assetRevocationTarget,
      type: this._type,
      group: this._group,
      genesisID: this._genesisID,
      genesisHash: this._genesisHash,
      firstRound: this._firstRound,
      lastRound: this._lastRound,
      fee: this._fee,
      flatFee: this._flatFee,
    }
  }

  /** Action properties including raw data */
  public get contract(): any {
    return notImplemented()
  }
}
