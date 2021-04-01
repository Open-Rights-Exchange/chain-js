/** Transaction options used when contructing a trnasaction header */
export type TransactionOptions = any

/** Transaction receipt returned from chain after submitting the transaction */
/** It can contain fields like transaction id, transaction hash etc */
export type TransactionResult = {
  transactionId: TransactionId
  chainResponse: TransactionChainResponse
}

export type MultisigOptions = {
  pluginType: string
  options: any
}

export type TransactionChainResponse = any
export type TransactionId = string

/** Resouces required for transaction */
export type TransactionResources = any

/** Cost required for transaction */
export type TransactionCost = any

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
