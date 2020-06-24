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
    const { to, from, amount, note } = actionInput
    this._to = to
    this._from = from
    this._amount = amount
    this._note = note
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
    }
  }

  /** Action properties including raw data */
  public get contract(): any {
    return notImplemented()
  }
}
