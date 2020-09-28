import { bufferToHex, BN } from 'ethereumjs-util'
import { Transaction as EthereumJsTx } from 'ethereumjs-tx'
import {
  decimalToHexString,
  isNullOrEmpty,
  nullifyIfEmpty,
  removeEmptyValuesInJsonObject,
  toHexStringIfNeeded,
} from '../../helpers'
import {
  convertBufferToHexStringIfNeeded,
  ethereumTrxArgIsNullOrEmpty,
  generateDataFromContractAction,
  isValidEthereumAddress,
  toEthereumTxData,
  toEthBuffer,
  toWeiString,
  isDecimalString,
} from './helpers'
import {
  EthereumActionContract,
  EthereumActionHelperInput,
  EthereumAddress,
  EthereumRawTransactionAction,
  EthereumTxData,
  EthereumTransactionAction,
  EthUnit,
} from './models'
import { ZERO_HEX, ZERO_ADDRESS } from './ethConstants'
import { throwNewError } from '../../errors'
import { IndexedObject } from '../../models'

export type ActionChainOptions = {
  chain: string
  hardfork: string
}

/** Helper class to ensure transaction actions properties are set correctly */
export class EthereumActionHelper {
  // properties stored as hex stings (not raw Buffers)
  private _nonce: string

  private _gasLimit: string

  private _gasPrice: string

  private _data: EthereumTxData

  private _to: EthereumAddress

  private _value: string | number | BN

  private _from: EthereumAddress

  private _contract: EthereumActionContract

  private _v: string

  private _r: string

  private _s: string

  private _chainOptions: ActionChainOptions

  /** Creates a new Action from 'human-readable' transfer or contact info
   *  OR from 'raw' data property
   *  Allows access to human-readable properties (method, parameters) or raw data (hex) */
  constructor(actionInput: EthereumActionHelperInput, chainOptions: ActionChainOptions) {
    this._chainOptions = chainOptions
    this.assertAndValidateEthereumActionInput(actionInput)
  }

  /** apply rules for imput params, set class private properties, throw if violation */
  private assertAndValidateEthereumActionInput(actionInput: EthereumActionHelperInput) {
    const {
      nonce,
      gasPrice: gasPriceInput,
      gasLimit: gasLimitInput,
      from,
      to,
      data,
      value: valueInput,
      v,
      r,
      s,
      contract,
    } = actionInput

    // Checking if gasPrice value given as decimal Gwei string
    // if so, we are converting it to Wei before converting to hex string
    const gasPriceInWei = isDecimalString(gasPriceInput)
      ? toWeiString(gasPriceInput as string, EthUnit.Gwei)
      : gasPriceInput

    // convert decimal strings to hex strings
    const gasPrice = toHexStringIfNeeded(gasPriceInWei)
    const gasLimit = toHexStringIfNeeded(gasLimitInput)
    const value = toHexStringIfNeeded(valueInput)

    // cant provide both contract and data properties
    if (!ethereumTrxArgIsNullOrEmpty(contract) && !ethereumTrxArgIsNullOrEmpty(data)) {
      throwNewError('You can provide either data or contract but not both')
    }

    // convert from param into an address string (and chack for validity)
    const fromAddress = convertBufferToHexStringIfNeeded(from)
    if (isNullOrEmpty(fromAddress)) {
      this._from = ZERO_ADDRESS
    } else if (isValidEthereumAddress(fromAddress)) {
      this._from = fromAddress
    } else {
      throwNewError(`From value (${from} is not a valid ethereum address`)
    }

    // set data from provided data or contract properties
    if (!ethereumTrxArgIsNullOrEmpty(data)) this._data = toEthereumTxData(data)
    else if (!ethereumTrxArgIsNullOrEmpty(contract)) {
      this._data = generateDataFromContractAction(contract)
      this._contract = contract
    } else this._data = toEthereumTxData(ZERO_HEX)

    // use helper library to consume tranasaction and allow multiple types for input params
    const ethJsTx = new EthereumJsTx(
      {
        nonce,
        gasPrice,
        gasLimit,
        to,
        data: this._data,
        value,
        v,
        r,
        s,
      },
      this._chainOptions,
    )
    this._nonce = bufferToHex(ethJsTx.nonce)
    this._gasLimit = bufferToHex(ethJsTx.gasLimit)
    this._gasPrice = bufferToHex(ethJsTx.gasPrice)
    this._to = bufferToHex(ethJsTx.to)
    this._value = bufferToHex(ethJsTx.value)
    this._data = toEthereumTxData(bufferToHex(ethJsTx.data))
    this._v = bufferToHex(ethJsTx.v)
    this._r = bufferToHex(ethJsTx.r)
    this._s = bufferToHex(ethJsTx.s)
  }

  /** set gasLimit - value should be a decimal string in units of gas e.g. '21000' */
  set gasLimit(value: string) {
    const valueHex = decimalToHexString(value)
    this.updateActionProperty('gasLimit', valueHex)
  }

  /** set gasPrice - value should be a decimal string in units of GWEI e.g. '123' */
  set gasPrice(value: string) {
    const valueHex = decimalToHexString(toWeiString(value, EthUnit.Gwei))
    this.updateActionProperty('gasPrice', valueHex)
  }

  /** set nonce - value is a string or Buffer */
  set nonce(value: string) {
    const valueHex = decimalToHexString(value)
    this.updateActionProperty('nonce', valueHex)
  }

  /** update a single property in this action */
  private updateActionProperty(propertyName: string, value: any) {
    const actionInput: EthereumTransactionAction & IndexedObject = this.action
    actionInput[propertyName] = value
    this.assertAndValidateEthereumActionInput(actionInput)
  }

  /** Checks is data value is empty or implying 0 */
  get hasData(): boolean {
    return !ethereumTrxArgIsNullOrEmpty(this._data)
  }

  /** Action properties (encoded as hex string for most fields)
   *  Returns null for any 'empty' Eth values e.g. (0x00...00) */
  public get action(): EthereumTransactionAction {
    const returnValue = {
      nonce: ethereumTrxArgIsNullOrEmpty(this._nonce) ? null : this._nonce,
      gasLimit: ethereumTrxArgIsNullOrEmpty(this._gasLimit) ? null : this._gasLimit,
      gasPrice: ethereumTrxArgIsNullOrEmpty(this._gasPrice) ? null : this._gasPrice,
      to: ethereumTrxArgIsNullOrEmpty(this._to) ? null : this._to,
      from: ethereumTrxArgIsNullOrEmpty(this._from) ? null : this._from,
      data: ethereumTrxArgIsNullOrEmpty(this._data) ? null : toEthereumTxData(this._data),
      value: ethereumTrxArgIsNullOrEmpty(this._value) ? null : this._value,
      v: ethereumTrxArgIsNullOrEmpty(this._v) ? null : this._v,
      r: ethereumTrxArgIsNullOrEmpty(this._r) ? null : this._r,
      s: ethereumTrxArgIsNullOrEmpty(this._s) ? null : this._s,
    }
    removeEmptyValuesInJsonObject(returnValue)
    return returnValue
  }

  /** Action properties in raw form (encoded as Buffer) */
  public get raw(): EthereumRawTransactionAction {
    const returnValue = {
      nonce: nullifyIfEmpty(toEthBuffer(this._nonce)),
      gasLimit: nullifyIfEmpty(toEthBuffer(this._gasLimit)),
      gasPrice: nullifyIfEmpty(toEthBuffer(this._gasPrice)),
      to: nullifyIfEmpty(toEthBuffer(this._to)),
      from: nullifyIfEmpty(toEthBuffer(this._from)),
      data: nullifyIfEmpty(toEthBuffer(this._data)),
      value: nullifyIfEmpty(toEthBuffer(this._value)),
      v: nullifyIfEmpty(toEthBuffer(this._v)),
      r: nullifyIfEmpty(toEthBuffer(this._r)),
      s: nullifyIfEmpty(toEthBuffer(this._s)),
    }
    removeEmptyValuesInJsonObject(returnValue)
    return returnValue
  }

  /** Action properties including raw data */
  public get contract(): EthereumActionContract {
    return this._contract
  }
}
