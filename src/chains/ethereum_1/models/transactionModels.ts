import { EthereumValue } from './generalModels'

/** Transaction 'header' options set to chain along with transaction */
export type EthereumTransactionOptions = {
  nonce?: EthereumValue
  gasPrice?: EthereumValue
  gasLimit?: EthereumValue
  chain: EthereumValue & (number | string)
  hardfork: EthereumValue & string
}

/** Transaction with hex data - ready to be signed and sent to chain */
export type EthereumRawTransaction = {
  nonce?: EthereumValue
  gasPrice?: EthereumValue
  gasLimit?: EthereumValue
  to?: EthereumAddress
  value?: EthereumValue
  data?: EthereumTxData
}

/** Transaction properties that contain the fee & priority info */
export type EthereumTransactionHeader = {
  nonce?: EthereumValue
  gasPrice?: EthereumValue
  gasLimit?: EthereumValue
}

/** Properties of an ETH transaction action
 *  Can be used to create or compose a new ETH action
 *  to and value - must both be present as a pair
 *  data or contract - to create an action, optionally provide one but not both
 *  contract property used only to generate data prop when creating an new action */
export type EthereumTransactionAction = {
  to?: EthereumAddress
  value?: EthereumValue
  data?: EthereumTxData
  contract?: EthereumActionContract
}

export type EthereumAddress = EthereumValue & (string | Buffer)
export type EthereumMethodName = EthereumValue & string
export type EthereumAbi = any[]

/** Information needed to generate Trx Data to invoke desired smart contract action */
export type EthereumActionContract = {
  abi: any
  method: string
  parameters: (string | number)[]
}

/** Hexadecimal format of contrat action data */
export type EthereumTxData = (string | Buffer) & EthereumTxDataBrand

/** Brand signifiying a valid value - assigned by using toEthereumTxData */
export enum EthereumTxDataBrand {
  _ = '',
}
