import { TransformableToBuffer } from 'ethereumjs-tx'
import { HEX_PREFIX } from '../../../constants'
import { isAString, hasPrefix } from '../../../helpers'
import { toEthBuffer } from './generalHelpers'
import { EthereumValue } from '../models'

export class EthereumData implements TransformableToBuffer {
  private _value: EthereumValue

  constructor(value: EthereumValue) {
    this._value = value
  }

  toBuffer() {
    // if a string (but not a hex prefixed string), convert to buffer and return
    if (isAString(this._value) && !hasPrefix(this._value, HEX_PREFIX)) {
      // TODO convert string value to hex encoded string - this is just a placeholder
      const hexString = this._value
      return toEthBuffer(hexString)
    }

    return toEthBuffer(this._value)
  }
}
