import { EthereumValue } from './generalModels'

/** Transaction options used when contructing a trnasaction header */
export type EthereumTransactionOptions = {
  nonce?: EthereumValue
  gasPrice?: EthereumValue
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
