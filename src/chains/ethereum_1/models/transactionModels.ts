import { BN } from 'ethereumjs-util'
import { EthereumValue } from './generalModels'

export type EthereumAbi = any[]
/** Information needed to generate Trx Data to invoke desired smart contract action */
export type EthereumActionContract = {
  abi: any
  method: string
  parameters: (string | number)[]
}

export type EthereumAddress = EthereumValue & (string | Buffer)

export type EthereumMethodName = EthereumValue & string

/** Transaction with hex data - ready to be signed and sent to chain */
export type EthereumRawTransaction = {
  nonce?: EthereumValue
  gasPrice?: EthereumValue
  gasLimit?: EthereumValue
  to?: EthereumAddress
  value?: EthereumValue | BN
  data?: EthereumTxData
  v?: EthereumValue
  r?: EthereumValue
  s?: EthereumValue
}

/** Properties of an ETH transaction action
 *  Can be used to create or compose a new ETH action
 *  to and value - must both be present as a pair
 *  data or contract - to create an action, optionally provide one but not both
 *  contract property used only to generate data prop when creating an new action */
export type EthereumTransactionAction = {
  to?: EthereumAddress
  from?: EthereumAddress
  value?: EthereumValue | BN
  data?: EthereumTxData
  contract?: EthereumActionContract
}

/** Transaction properties that contain the fee & priority info */
export type EthereumTransactionHeader = {
  nonce?: EthereumValue
  gasPrice?: EthereumValue
  gasLimit?: EthereumValue
}

/** Transaction 'header' options set to chain along with transaction */
export type EthereumTransactionOptions = {
  nonce?: EthereumValue
  gasPrice?: EthereumValue
  gasLimit?: EthereumValue
  chain: number | string
  hardfork: EthereumValue & string
}

/** Hexadecimal format of contrat action data */
export type EthereumTxData = (string | Buffer) & EthereumTxDataBrand

/** Brand signifiying a valid value - assigned by using toEthereumTxData */
export enum EthereumTxDataBrand {
  _ = '',
}
