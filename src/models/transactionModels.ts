import { ResourceEstimationType } from './generalModels'

/** Transaction options used when contructing a transaction header */
export type TransactionOptions = any

/** Transaction receipt returned from chain after submitting the transaction */
/** It can contain fields like transaction id, transaction hash etc */
export type TransactionResult = {
  transactionId: TransactionId
  chainResponse: TransactionChainResponse
}

export type TransactionChainResponse = any
export type TransactionId = string

/** Resouces required for transaction */
export type TransactionResources = {
  [key: string]: any
  /** How completely the resources have been estimated */
  estimationType: ResourceEstimationType
}

/** Fee required for transaction */
export type TransactionFee = any

/** Transaction fee priority */
export enum TxExecutionPriority {
  Slow = 'slow',
  Average = 'average',
  Fast = 'fast',
}

/** Specifies how many block confirmations should be received before considering transaction is complete */
export enum ConfirmType {
  /** Don't wait for any block confirmations */
  None = 0,
  /** After first block */
  After001 = 1,
  After007 = 7,
  After010 = 10,
  /** After final block */
  Final = 999999,
}

/** Transaction fee priority */
export enum TransactionStatus {
  Executed = 'executed',
  Dead = 'dead',
  Pending = 'pending',
}

/** Type of expiration constraint */
export enum TransactionExpirationType {
  /** No expiration constraint */
  None = 'none',
  /** transaction is only valid between a start block and end block - the start and end are usually a limited number of blocks or seconds apart */
  Window = 'window',
  /** transaction will expire at a number of blocks or seconds in the future */
  Deadline = 'deadline',
}

/** Transaction expiration constraints */
export type TransactionExpirationOptions = {
  /** Type of expiration constraint */
  transactionExpirationType: TransactionExpirationType
  /** the maximum number of seconds that a transaction can valid for from now (limits how far in future is valid) */
  maxFutureSeconds?: number
  /** the maximum width between the start block and end block (in seconds) */
  maxWindowSeconds?: number
}

/** Transaction fee multipliers */
export type TransactionFeePriorityMultipliers = {
  [key in TxExecutionPriority]: number
}

export type ActualCost = {
  fee?: any
  resources?: any
}
