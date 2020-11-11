import { toBuffer, BN } from 'ethereumjs-util'
import { ERC20_TYPES } from '../templates/abis/erc20Abi'
import { EthereumActionContract, EthereumAddress, EthereumPrivateKey, EthereumPublicKey } from '../models'
import { ensureHexPrefix } from '../../../helpers'

/** Attempts to transform a value to a standard Buffer class */
export function toEthBuffer(data: string | BN | Buffer | number): Buffer {
  return toBuffer(data)
}

export function matchKnownAbiTypes(contract: EthereumActionContract) {
  const isERC20Abi = ERC20_TYPES.every(type => {
    return contract.abi?.find((abiField: any) => {
      return abiField.name === type.name && abiField.type === type.type
    })
  })

  return {
    erc20: isERC20Abi,
  }
}

/** Compare two '0x' pre-fixed eth values (e.g. address, public key, private key)
 * adds 0x if missing, also aligns case (to lowercase) */
export function isSameEthHexValue(
  value1: EthereumPublicKey | EthereumAddress | EthereumPrivateKey,
  value2: EthereumPublicKey | EthereumAddress | EthereumPrivateKey,
) {
  return ensureHexPrefix(value1) === ensureHexPrefix(value2)
}
