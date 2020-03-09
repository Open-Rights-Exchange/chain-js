/** Transaction options used when contructing a trnasaction header */
export type TransactionOptions = any

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
