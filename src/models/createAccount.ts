/** Type of account to craate */
export enum AccountType {
  /** Native account for chain tyep (EOS, Ethereum, etc.) */
  Native,
  /** Native account on ORE chain */
  NativeOre,
  /** Native account created by calling an proxy (escrow) contract that actually creates the account */
  CreateEscrow,
  /** Virtual account - if supported by chain */
  VirtualNested,
}

export type CreateAccountOptions = any
