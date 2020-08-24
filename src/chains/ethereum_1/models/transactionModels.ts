// eslint-disable-next-line import/no-extraneous-dependencies
import { TransactionReceipt } from 'web3-core'
import BN from 'bn.js'
import { EthereumValue } from './generalModels'

export type EthereumAbi = any[]
/** Information needed to generate Trx Data to invoke desired smart contract action */
export type EthereumActionContract = {
  abi: any
  method: string
  parameters: (EthereumValue | EthereumValue[])[]
}

/** Ethereum address encoded as a Hex String */
export type EthereumAddress = string

/** Ethereum address encoded as a Buffer */
export type EthereumAddressBuffer = Buffer

export type EthereumMethodName = EthereumValue & string

/** Transaction with hex data */
export type EthereumRawTransaction = {
  nonce?: Buffer
  gasPrice?: Buffer
  gasLimit?: Buffer
  to?: EthereumAddressBuffer
  value?: Buffer
  data?: Buffer
  v?: Buffer
  r?: Buffer
  s?: Buffer
}

/** Transaction action with hex data */
export type EthereumRawTransactionAction = {
  from?: EthereumAddressBuffer
  nonce?: Buffer
  gasPrice?: Buffer
  gasLimit?: Buffer
  to?: EthereumAddressBuffer
  value?: Buffer
  data?: Buffer
}

/** Transaction with hex data - ready to be signed and sent to chain */
export type EthereumActionHelperInput = {
  nonce?: EthereumValue
  gasPrice?: EthereumValue
  gasLimit?: EthereumValue
  from?: EthereumAddress | EthereumAddressBuffer
  to?: EthereumAddress | EthereumAddressBuffer
  value?: EthereumValue
  data?: EthereumTxData
  v?: EthereumValue
  r?: EthereumValue
  s?: EthereumValue
  contract?: EthereumActionContract
}

/** Properties of an ETH transaction action
 *  Can be used to create or compose a new ETH action
 *  to and value - must both be present as a pair
 *  data or contract - to create an action, optionally provide one but not both
 *  contract property used only to generate data prop when creating an new action */
export type EthereumTransactionAction = {
  nonce?: string
  gasPrice?: string
  gasLimit?: string
  to?: EthereumAddress
  from?: EthereumAddress
  value?: string | number | BN
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
  hardfork: string
}

/** Hexadecimal format of contrat action data */
export type EthereumTxData = (string | Buffer) & EthereumTxDataBrand

/** Brand signifiying a valid value - assigned by using toEthereumTxData */
export enum EthereumTxDataBrand {
  _ = '',
}

/** Payload returned after sending transaction to chain */
export type EthereumTxResult = {
  transactionId: string
  chainResponse: EthereumTxChainResponse
}

/** Response from chain after sending transaction */
export type EthereumTxChainResponse = TransactionReceipt
