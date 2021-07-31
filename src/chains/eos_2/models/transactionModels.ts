import { EosPublicKey } from './cryptoModels'
import { EosActionAuthorizationStruct } from './eosStructures'
import { EosEntityName } from './generalModels'

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

/** EOS Raw Data Structure for contract action - i.e. including name, authorizations, and serialized representation */
export type EosActionStruct = {
  account: EosEntityName
  name: string
  authorization: EosActionAuthorizationStruct[]
  data?: any
  hex_data?: string
}

/** EOS Raw Data Structure for chain transaction - i.e. including header, actions, and keys */
export interface EosTransactionStruct {
  expiration: string
  ref_block_num: number // int32
  ref_block_prefix: number // int32
  max_net_usage_words: number | string // a whole number - int32 or string
  max_cpu_usage_ms: number | string // a whole number - int32 or string
  delay_sec: number // int32
  context_free_actions: EosActionStruct[]
  actions: EosActionStruct[]
  available_keys: EosPublicKey[]
}

export type EosSerializedTransaction = EosRawTransaction | string

export type EosRawTransaction = Uint8Array
