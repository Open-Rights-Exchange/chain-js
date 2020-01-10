/**
 * The Account interface declares the operations that all concrete (chain)account classes must implement
 */
export interface Account {
  /** Account name */
  name: any
  /** Public Key(s) associated with the account */
  publicKeys: string[]
  /** Returns the underlying raw data from the chain's account structure */
  value: any

  /** Sign the transaction body with private key(s) and add to attached signatures */
  doesAccountExist(accountName: string): Promise<{ exists: boolean; account: Account }>
  /** Retrieves account value from chain and populates this account object */
  fetchFromChain(accountName?: string): Promise<void>
  /** JSON representation of account data */
  toJson(): any
}
