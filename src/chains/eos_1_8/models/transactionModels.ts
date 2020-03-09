/** Transaction options used when contructing a trnasaction header */
export type EosTransactionOptions = {
  /** Uses the time from the block which is `blocksBehind` behind head block
   *   to calclate the expiratation time (blockBehind_time + expireSeconds) */
  blocksBehind?: number
  /** Number of seconds after which transaction expires - must be submitted to the chain before then */
  expireSeconds?: number
}
