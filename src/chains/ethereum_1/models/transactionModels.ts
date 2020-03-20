import { EthereumValue } from './generalModels'

/** Transaction options used when contructing a trnasaction header */
export type EthereumTransactionOptions = {
  /** Uses the time from the block which is `blocksBehind` behind head block
   *   to calclate the expiratation time (blockBehind_time + expireSeconds) */
  gasPrice?: EthereumValue
  /** Number of seconds after which transaction expires - must be submitted to the chain before then */
  gasLimit?: EthereumValue
  chain: EthereumValue
  hardfork: EthereumValue
}

export type EthereumRawTransaction = {
  nonce?: string
  gasPrice?: string | number
  gasLimit?: string | number
  to?: string
  value?: string | number
  data?: string
}

export type EthereumTransactionHeader = {
  nonce?: EthereumValue
  gasPrice?: EthereumValue
  gasLimit?: EthereumValue
}

export type EthereumTransactionAction = {
  to?: EthereumAddress
  value?: EthereumValue
  data?: EthereumValue
}

export type EthereumAddress = EthereumValue & string
export type EthereumMethodName = EthereumValue & string
export type EthereumAbi = any[]

export type EthereumComposeActionContractInput = {
  abi: EthereumAbi
  address: EthereumAddress
  method: EthereumMethodName
  params?: EthereumValue
}

export type EthereumContractAction = {
  abi: any
  address: string
  method: string
  parameters: (string | number)[]
}

export type EthereumActionInput = {
  to?: EthereumAddress
  value?: EthereumValue
  contract?: EthereumContractAction
  data?: EthereumValue
}
