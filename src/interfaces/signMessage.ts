import { PrivateKey, SignMessageOptions, SignMessageResult, SignMessageValidateResult } from '../models'
/**
 * The SignMessage interface is used to sign a transaction string and validate it
 */
export interface SignMessage {
  /** SignMessage options set in constructor */
  options: SignMessageOptions
  // ** Whether signature request has been validated - via vaidate() */
  isValidated: boolean
  /** Sign the message  with private key */
  sign(privateKeys: PrivateKey[]): Promise<SignMessageResult>
  /** Verifies that the signature is valid, depending on the options, checks the message format (e.g. ERC 712)
   *  Throws if any problems */
  validate(): Promise<SignMessageValidateResult>
}
