// eslint-disable-next-line import/no-extraneous-dependencies
import { TransactionReceipt } from 'web3-core'
import BN from 'bn.js'
import { TxExecutionPriority } from '../../../models'
import { EthereumEntityName, EthereumMultiValue } from './generalModels'

export type EthereumAbi = any[]
/** Information needed to generate Trx Data to invoke desired smart contract action */
export type EthereumActionContract = {
  abi: any
  method: string
  parameters: (EthereumMultiValue | EthereumMultiValue[])[]
}

/** Ethereum address encoded as a Hex String */
export type EthereumAddress = EthereumEntityName

/** Ethereum address encoded as a Buffer */
export type EthereumAddressBuffer = Buffer

export type EthereumMethodName = EthereumMultiValue & string

/** Transaction with raw Buffer data */
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

/** Transaction action with raw Buffer data */
export type EthereumRawTransactionAction = {
  from?: EthereumAddressBuffer
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

// todo: strongly type this to mirror EthereumJsTx - but also allow decimal string for gasPrice, gasLimit, value
/** Transaction data that support multiple types for each field (e.g. Buffer, hex string, etc.) */
export type EthereumActionHelperInput = {
  nonce?: EthereumMultiValue
  gasPrice?: EthereumMultiValue
  gasLimit?: EthereumMultiValue
  from?: EthereumAddress | EthereumAddressBuffer
  to?: EthereumAddress | EthereumAddressBuffer
  value?: EthereumMultiValue
  data?: EthereumTxData
  v?: EthereumMultiValue
  r?: EthereumMultiValue
  s?: EthereumMultiValue
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

/** Transaction properties that contain the gas & nonce */
export type EthereumTransactionHeader = {
  nonce?: Buffer
  gasPrice?: Buffer
  gasLimit?: Buffer
}

/** Transaction 'header' options set to chain along with transaction */
export type EthereumTransactionOptions<PluginMultisigOptions> = {
  nonce?: string
  gasPrice?: string
  gasLimit?: string
  chain: number | string
  hardfork: string
  maxFeeIncreasePercentage?: number
  executionPriority?: TxExecutionPriority
  multisigOptions?: PluginMultisigOptions
}

export type EthereumSetDesiredFeeOptions = {
  gasLimitOverride?: string
  gasPriceOverride?: string
}

/** Contract action data encoded as hex string */
export type EthereumTxData = string & EthereumTxDataBrand

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

/** Cost in chain resources to run the transaction
 *  Fee is in GWEI */
export type EthereumTransactionCost = {
  fee: string
}

/** Resouces required for transaction (in terms of gas) */
export type EthereumTransactionResources = {
  gas: string
}
