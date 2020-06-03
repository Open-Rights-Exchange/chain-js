export type Algo = any

export type AlgorandConnectionSettings = {
  server: string
  token: string
  port?: string
}

/**  ALGO TODO: Currently nothing is needed in algorand chain settings. 
 Once any such parameter is there, change the type from any to an object containing specigic properties */
export type AlgorandChainSettings = any
