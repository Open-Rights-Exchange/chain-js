export type Algo = any

/**
 * server: chain endpoint
 * token: api token required to access the chain network
 * token's format: {'X-API-Key': '...'}
 */
export type AlgorandConnectionSettings = {
  server: URL
  token: string
  port?: string
}

/** Currently nothing is needed in algorand chain settings.
 * Once any such parameter is there, change the type from any to an object containing specific properties */
export type AlgorandChainSettings = any

/**  Currently nothing is needed in algorand chain communication settings. 
 Once any such parameter is there, change the type from any to an object containing specific properties */
export type AlgorandChainSettingsCommunicationSettings = any
