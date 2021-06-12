// Ethereum Gnosis Multisig plugin defaults

import { toEthereumAddress } from '../../../helpers'

export const ZERO_ADDRESS = toEthereumAddress('0x0000000000000000000000000000000000000000')

export const DEFAULT_CREATE_ACCOUNT_SALT_NONCE = 1
export const DEFAULT_TX_SAFE_GAS = 0
export const DEFAULT_TX_BASE_GAS = 0
export const DEFAULT_TX_GAS_PRICE = 0
export const EMPTY_TX_VALUE = 0
export const EMPTY_TX_OPERATION = 0
export const DEFAULT_REFUND_RECIEVER = ZERO_ADDRESS
export const DEFAULT_GAS_TOKEN = ZERO_ADDRESS
export const DEFAULT_FALLBACK_HANDLER_ADDRESS = toEthereumAddress('0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4')
export const DEFAULT_GNOSIS_SAFE_SINGLETION_ADDRESS = toEthereumAddress('0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552')
export const DEFAULT_PROXY_FACTORY_ADDRESS = toEthereumAddress('0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2')
