import { 
  PolkadotPublicKey, 
  PolkadotNewKeysOptions 
} from './'

export type PolkadotCreateAccountOptions = {
  publicKey?: PolkadotPublicKey
  newKeysOptions: PolkadotNewKeysOptions
}

/** Type of account to create */
export enum EthereumNewAccountType {
  /** Native account for chain type (Ethereum, etc.) */
  Native = 'Native',
}
