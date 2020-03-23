import { EthereumValue } from './generalModels'

/** Transaction options used when contructing a trnasaction header */
export type EthereumTransactionOptions = {
  nonce?: EthereumValue
  gasPrice?: EthereumValue
  gasLimit?: EthereumValue
  chain: EthereumValue
  hardfork: EthereumValue
}

/** Transaction type that we use to call prepareToBeSigned() */
export type EthereumRawTransaction = {
  nonce?: string
  gasPrice?: string | number
  gasLimit?: string | number
  to?: string
  value?: string | number
  data?: string
}

/** Transaction properties that contain the fee & priority info */
export type EthereumTransactionHeader = {
  nonce?: EthereumValue
  gasPrice?: EthereumValue
  gasLimit?: EthereumValue
}

/** Transaction properties that contain Eth transfer and contract action info */
export type EthereumTransactionAction = {
  to?: EthereumAddress
  value?: EthereumValue
  data?: EthereumValue
}

export type EthereumAddress = EthereumValue & string
export type EthereumMethodName = EthereumValue & string
export type EthereumAbi = any[]

/** Information needed to generate Trx Data to invoke desired smart contract action */
export type EthereumContractAction = {
  abi: any
  address: string
  method: string
  parameters: (string | number)[]
}

/** Ethereum action interface for both Eth transfer and smart contract actions */
export type EthereumActionInput = {
  to?: EthereumAddress
  value?: EthereumValue
  contract?: EthereumContractAction
  data?: EthereumTxData
}

/** Hexadecimal format of contrat action data */
export type EthereumTxData = string & EthereumTxDataBrand

/** Brand signifiying a valid value - assigned by using toEthereumTxData */
export enum EthereumTxDataBrand {
  _ = '',
}
