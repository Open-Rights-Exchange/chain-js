/** Type of account to craate */
export enum EthereumNewAccountType {
  /** Native account for chain tyep (EOS, Ethereum, etc.) */
  Native = 'Native',
}

export type EthereumCreateAccountOptions = {
  newKeysOptions?: {
    password?: string
    salt?: string
  }
}
