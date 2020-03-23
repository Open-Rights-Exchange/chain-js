import { isNullOrEmpty } from '../../helpers'
import { EthereumActionInput, EthereumAddress, EthereumValue, EthereumContractAction, EthereumTxData } from './models'
import { ethereumTrxArgIsNullOrEmpty, generateDataFromContractAction, toEthereumTxData } from './helpers'
import { ZERO_HEX, ZERO_ADDRESS } from '../../constants'
import { throwNewError } from '../../errors'

export class EthereumAction {
  private _data: EthereumTxData

  private _to: EthereumAddress

  private _value: EthereumValue

  private _contract: EthereumContractAction

  /** Creates a new Action from 'human-readable' transfer or contact info
   *  OR from 'raw' data property
   *  Allows access to human-readable properties (method, parameters) or raw data (hex) */
  constructor(action?: EthereumActionInput) {
    // if raw data is provided, use that to set the action properties
    const { to, value, contract, data } = action

    this._to = isNullOrEmpty(to) ? ZERO_ADDRESS : to
    this._value = isNullOrEmpty(value) ? ZERO_HEX : value
    if (!ethereumTrxArgIsNullOrEmpty(data)) this._data = toEthereumTxData(generateDataFromContractAction(contract))
    else if (isNullOrEmpty(contract) && ethereumTrxArgIsNullOrEmpty(data)) this._data = toEthereumTxData(ZERO_HEX)
    else if (!isNullOrEmpty(contract)) {
      this._contract = contract
      this._data = toEthereumTxData(generateDataFromContractAction(contract))
    }
  }

  /** Returns 'hex or binary' data */
  get data() {
    return this._data
  }

  /** Checks is data value is empty or implying 0 */
  get hasData(): boolean {
    return !ethereumTrxArgIsNullOrEmpty(this._data)
  }

  // check if both data and to & value fields are empty, if so throw error
  private validateActionBody(): void {
    if (
      ethereumTrxArgIsNullOrEmpty(this._data) &&
      (ethereumTrxArgIsNullOrEmpty(this._to) || ethereumTrxArgIsNullOrEmpty(this._value))
    )
      throwNewError('Action is not valid.')
  }

  public getActionBody(): EthereumActionInput {
    this.validateActionBody()
    return {
      to: this._to,
      value: this._value,
      data: this._data,
      contract: this._contract,
    }
  }

  public assertValidateData(data: any): boolean {
    if (!data) {
      return false
    }
    return true
  }
}
