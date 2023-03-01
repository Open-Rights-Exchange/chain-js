/** SignString options used when contructing a signString object */
export type SignStringOptions = {
  signMethod: string
}

/** Result of the signString transacion containing the signature and any other details the signer would like to return */
export type SignStringSignResult = {
  signature: string
  details?: any
}

/* A return structure allowing the user to see an example transaction if validation fails */
export type SignStringValidateResult = {
  valid: boolean
  message?: string
  example?: any
}
