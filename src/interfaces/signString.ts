import { PrivateKey, SignStringOptions, SignStringSignResult, SignStringValidateResult } from '../models'
/**
 * The Transaction interface declares the operations that all concrete chain (chain)transaction classes must implement
 */
export interface SignString {
  /** Transction options set in constructor */
  options: SignStringOptions
  // ** Whether transaction has been validated - via vaidate() */
  isValidated: boolean
  /** Sign the transaction body with private key(s) and add to attached signatures */
  sign(privateKeys: PrivateKey[]): Promise<SignStringSignResult>
  /** Verifies that all accounts and permisison for actions exist on chain.
   *  Throws if any problems */
  validate(): Promise<SignStringValidateResult>
}
