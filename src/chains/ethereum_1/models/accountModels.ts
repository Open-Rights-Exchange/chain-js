/** Type of account to craate */
export enum EthereumAccountType {
  /** Native account for chain tyep (EOS, Ethereum, etc.) */
  Native = 'Native',
}

export type EthereumCreateAccountOptions = {
  // newAccountName: EthereumEntityName,
  // creatorAccountName: EthereumEntityName
  // creatorPermission: EthereumEntityName
  /** to generate new keys (using newKeysOptions), leave both publicKeys as null */
  publicKeys?: {
    // owner?: EthereumPublicKey
    // active?: EthereumPublicKey
  }
  newKeysOptions?: {
    newKeysPassword?: string
    newKeysSalt?: string
  }
}
