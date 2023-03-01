/** SignString options used when contructing a signString object */
export type SignStringOptions = {
  signMethod: string
}

/** Transaction receipt returned from chain after submitting the transaction */
/** It can contain fields like transaction id, transaction hash etc */
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
