import { isNullOrEmpty } from '../../helpers'
import { EthereumAddress, EthereumValue, EthereumTxData, EthereumTransactionAction } from './models'
import { ethereumTrxArgIsNullOrEmpty, generateDataFromContractAction, toEthereumTxData } from './helpers'
import { ZERO_HEX, ZERO_ADDRESS } from '../../constants'
import { throwNewError } from '../../errors'

/** Helper class to ensure transaction actions properties are set correctly */
export class EthereumActionHelper {
  private _data: EthereumTxData

  private _to: EthereumAddress

  private _value: EthereumValue

  // private _from: EthereumAddress

  /** Creates a new Action from 'human-readable' transfer or contact info
   *  OR from 'raw' data property
   *  Allows access to human-readable properties (method, parameters) or raw data (hex) */
  constructor(actionInput: EthereumTransactionAction) {
    this.assertAndValidateEthereumActionInput(actionInput)
  }

  /** apply rules for imput params, set class private properties, throw if violation */
  private assertAndValidateEthereumActionInput(actionInput: EthereumTransactionAction) {
    const { to, from, value, contract, data } = actionInput

    this._to = isNullOrEmpty(to) ? ZERO_ADDRESS : to
    // this._from = isNullOrEmpty(from) ? ZERO_ADDRESS : from
    this._value = isNullOrEmpty(value) ? ZERO_HEX : value

    // cant provide both contract and data properties
    if (!ethereumTrxArgIsNullOrEmpty(contract) && !ethereumTrxArgIsNullOrEmpty(data)) {
      throwNewError('You can provide either data or contract but not both')
    }

    // set data from provided data or contract properties
    if (!ethereumTrxArgIsNullOrEmpty(data)) this._data = data
    else if (!ethereumTrxArgIsNullOrEmpty(contract)) this._data = generateDataFromContractAction(contract)
    else this._data = toEthereumTxData(ZERO_HEX)
  }

  /** Returns 'hex or binary' data */
  get data() {
    return this._data
  }

  /** Checks is data value is empty or implying 0 */
  get hasData(): boolean {
    return !ethereumTrxArgIsNullOrEmpty(this._data)
  }

  /** Action properties including raw data */
  public get raw(): EthereumTransactionAction {
    return {
      to: this._to,
      // from: this._from,
      value: this._value,
      data: this._data,
    }
  }
}
