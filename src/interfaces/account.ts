import { ChainEntityName, PublicKey } from '../models'

/**
 * The Account interface declares the operations that all concrete (chain)account classes must implement
 */
export interface Account {
  /** Account name */
  name: ChainEntityName
  /** Public Key(s) associated with the account */
  publicKeys: PublicKey[]
  /** Returns the underlying raw data from the chain's account structure */
  value: any
  /** Whether the account is currently unused and can be reused
   *  Checks that existing account's active public key matches a designated unusedAccountPublicKey value */
  canBeRecycled: boolean
  /** Whether the account name can be used for new account
   *  For some chains it may check whether the name is in use */
  isValidNewAccountName(accountName: string): Promise<boolean>
  /** Sets the account name and associated address/public keys.
   * For some chains, loads the account from chain and populates this account object */
  load(accountName?: string): Promise<void>
  /** Whether chain requires/supports account creation/registration
   * Ex: EOS requires account creation before calling contracts */
  supportsOnChainAccountRegistry: boolean
  /** Whether chain support reusing account name by replacing account keys */
  supportsRecycling: boolean
  /** JSON representation of account data */
  toJson(): any
}
