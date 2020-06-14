/**
 * Chain response type after a transaction is confirmed on the chain
 */
export type AlgorandTxChainResponse = {
  type: string
  tx: string
  from: string
  fee: number
  'first-round': number
  'last-round': number
  noteb64: string
  round: number
  payment?: {
    to: string
    amount: number
    torewards: number
    closerewards: number
  }
  fromrewards?: number
  genesisID: string
  genesishashb64: string
  note: Buffer
}

/**
 * Chain response type after submitting a transaction
 */
export type AlgorandTxResult = {
  transactionId: string
  chainResponse: AlgorandTxChainResponse
}
