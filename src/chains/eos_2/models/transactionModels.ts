/** Transaction options used when contructing a trnasaction header */
export type EosTransactionOptions = {
  /** Uses the time from the block which is `blocksBehind` behind head block
   *   to calclate the expiratation time (blockBehind_time + expireSeconds) */
  blocksBehind?: number
  /** Number of seconds after which transaction expires - must be submitted to the chain before then */
  expireSeconds?: number
}

/** Payload returned after sending transaction to chain */
export type EosTxResult = {
  transactionId: string
  chainResponse: EosTxChainResponse
}

// helpful EOS type definitions - https://sourcegraph.com/github.com/eoscanada/eos-go/-/blob/responses.go#L69:6
/** Response from chain after sending transaction */
export type EosTxChainResponse = any
