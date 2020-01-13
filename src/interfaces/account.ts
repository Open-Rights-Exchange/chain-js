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

  /** Whether the account is currently unused and can be reused
   *  Checks that existing account's active public key matches a designated unusedAccountPublicKey value */
  canBeRecycled: boolean
  /** Tries to retrieve the account from the chain
   *  Returns { exists:true|false, account } */
  doesAccountExist(accountName: string): Promise<{ exists: boolean; account: any }>
  /** Retrieves account value from chain and populates this account object */
  fetchFromChain(accountName?: string): Promise<void>
  /** JSON representation of account data */
  toJson(): any
}
