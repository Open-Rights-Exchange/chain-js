/** SignMessage options used when contructing a SignMessage object */
export type SignMessageOptions = {
  signMethod: string
}

/** Result of the SignMessage transacion containing the signature and any other details the signer would like to return */
export type SignMessageResult = {
  signature: string
  details?: any
}

/* A return structure allowing the user to see an example transaction if validation fails */
export type SignMessageValidateResult = {
  valid: boolean
  message?: string
  example?: any
}
