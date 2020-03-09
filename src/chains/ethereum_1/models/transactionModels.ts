/** Transaction options used when contructing a trnasaction header */
export type EthTransactionOptions = {
  /** Uses the time from the block which is `blocksBehind` behind head block
   *   to calclate the expiratation time (blockBehind_time + expireSeconds) */
  gasPrice?: number
  /** Number of seconds after which transaction expires - must be submitted to the chain before then */
  gasLimit?: number
  chain?: string
  hardfork?: string
}

export type EthSerializedTransaction = {
  nonce?: string
  gasPrice?: string | number
  gasLimit?: string | number
  to?: string
  value?: string | number
  data?: string
}
