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
export const DEFAULT_FALLBACK_HANDLER_ADDRESS = toEthereumAddress('0x7Be1e66Ce7Eab24BEa42521cc6bBCf60a30Fa15E')
export const DEFAULT_GNOSIS_SAFE_SINGLETION_ADDRESS = toEthereumAddress('0x6851D6fDFAfD08c0295C392436245E5bc78B0185')
export const DEFAULT_PROXY_FACTORY_ADDRESS = toEthereumAddress('0x76E2cFc1F5Fa8F6a5b3fC4c8F4788F0116861F9B')
