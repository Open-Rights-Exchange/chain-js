import { AbiItem } from 'web3-eth-contract'
import { isNullOrEmpty } from '../../helpers'
import { EthereumActionInput, EthereumAddress, EthereumValue, EthereumContractAction } from './models'
import { ethereumTrxArgIsNullOrEmpty, generateDataFromContractAction } from './helpers'

export class EthereumAction {
  private _data: any

  private _abi: AbiItem[]

  private _to: EthereumAddress

  private _value: EthereumValue

  private _contract: EthereumContractAction

  private _isValidated: boolean

  /** Creates a new Action from 'human-readable' transfer or contact info
   *  OR from 'raw' data property
   *  Allows access to human-readable properties (method, parameters) or raw data (hex) */
  constructor(action?: EthereumActionInput) {
    // if raw data is provided, use that to set the action properties
    const { to, value, contract, data } = action

    this._to = isNullOrEmpty(to) ? '0x0000000000000000000000000000000000000000' : to
    this._value = isNullOrEmpty(value) ? '0x00' : value

    if (isNullOrEmpty(contract) && ethereumTrxArgIsNullOrEmpty(data)) this._data = '0x00'
    else if (!isNullOrEmpty(contract)) {
      this._contract = contract
      this._data = generateDataFromContractAction(contract)
    }
  }

  // 'hex or binary' data
  get data() {
    return this._data
  }

  get hasData(): boolean {
    return !ethereumTrxArgIsNullOrEmpty(this._data)
  }

  public assertValidateData(data: any): boolean {
    if (!data) {
      return false
    }
    // TODO: validate data - also allow '0x00' as valid
    // throw error if problem
    return true
  }
}
