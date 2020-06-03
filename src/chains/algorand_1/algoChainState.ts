import algosdk from 'algosdk'
import { throwAndLogError, throwNewError } from '../../errors'
import { ChainEndpoint, ChainInfo } from '../../models'
import { AlgorandConnectionSettings, AlgorandChainSettings, Algo } from './models/generalModels'
import { trimTrailingChars } from '../../helpers'

export class AlgorandChainState {
  private _activeEndpoint: ChainEndpoint

  private _chainInfo: ChainInfo

  private _chainSettings: AlgorandChainSettings

  private _endpoints: ChainEndpoint[]

  private _isConnected: boolean = false

  private _algo: Algo

  constructor(endpoints: ChainEndpoint[], settings?: AlgorandChainSettings) {
    this._endpoints = endpoints
    this._chainSettings = settings
  }

  /** Return chain URL endpoints */
  public get activeEndpoint(): ChainEndpoint {
    return this._activeEndpoint
  }

  /** * Return chain ID */
  public get chainId(): string {
    this.assertIsConnected()
    return this._chainInfo?.nativeInfo?.chain_id
  }

  /** Return chain info - e.g. head block number */
  public get chainInfo(): ChainInfo {
    this.assertIsConnected()
    return this._chainInfo
  }

  /** Return chain settings */
  public get chainSettings(): AlgorandChainSettings {
    return this._chainSettings
  }

  /** Return chain URL endpoints */
  public get endpoints(): ChainEndpoint[] {
    return this._endpoints
  }

  /** Whether any information has been retrieved from the chain yet
   *   A value here confirms that the network is working
   * */
  public get isConnected(): boolean {
    return this._isConnected
  }

  /** Connect to chain endpoint to verify that it is operational and to get latest block info */
  public async connect(): Promise<void> {
    try {
      if (!this._algo) {
        const { token, server, port } = this.determineAlgorandConnectionSettings()
        this._algo = new algosdk.Algod(token, server, port)
      }
      await this.getChainInfo()
      this._isConnected = true
    } catch (error) {
      throwAndLogError('Problem connecting to chain', 'chainConnectFailed', error)
    }
  }

  /** Retrieve lastest chain info including head block number and time */
  public async getChainInfo(): Promise<ChainInfo> {
    try {
      const nodeInfo = await this._algo.status()
      const { lastRound, lastConsensusVersion, timeSinceLastRound } = nodeInfo
      this._chainInfo = {
        headBlockNumber: lastRound,
        headBlockTime: new Date(timeSinceLastRound),
        // version example: 'https://github.com/algorandfoundation/specs/tree/e5f565421d720c6f75cdd186f7098495caf9101f'
        version: lastConsensusVersion,
        nativeInfo: nodeInfo,
      }
      return this._chainInfo
    } catch (error) {
      // ALGO TODO: map chain error
      throw new Error()
    }
  }

  // TODO: sort based on health info
  /**  * Choose the best Chain endpoint based on health and response time */
  private determineAlgorandConnectionSettings(): AlgorandConnectionSettings {
    const urlSetting = this.endpoints[0]
    const url = trimTrailingChars(urlSetting.url.href, '/')
    const { token, port = '' } = urlSetting.settings
    return { server: url, token, port }
  }

  // /** Retrieve a specific block from the chain */
  // public async getBlock(blockNumber: EthereumBlockNumber): Promise<BlockTransactionString> {
  //   try {
  //     this.assertIsConnected()
  //     const block = await this._web3.eth.getBlock(blockNumber)
  //     return block
  //   } catch (error) {
  //     const chainError = mapChainError(error, ChainFunctionCategory.Block)
  //     throw chainError
  //   }
  // }

  // /** Retrieve a the current price of gas from the chain */
  // public async getGasPrice(): Promise<number> {
  //   try {
  //     this.assertIsConnected()
  //     const gasPrice = parseInt(await this._web3.eth.getGasPrice(), 10)
  //     return gasPrice
  //   } catch (error) {
  //     const chainError = mapChainError(error, ChainFunctionCategory.ChainState)
  //     throw chainError
  //   }
  // }

  /** Confirm that we've connected to the chain - throw if not */
  public assertIsConnected(): void {
    if (!this._isConnected) {
      throwNewError('Not connected to chain')
    }
  }

  // /** Get transaction count for an address
  //  *  Useful to calculate transaction nonce propery */
  // public async getTransactionCount(
  //   address: EthereumAddress & string,
  //   defaultBlock: EthereumBlockNumber,
  // ): Promise<number> {
  //   try {
  //     return this._web3.eth.getTransactionCount(ensureHexPrefix(address), defaultBlock)
  //   } catch (error) {
  //     const chainError = mapChainError(error, ChainFunctionCategory.Transaction)
  //     throw chainError
  //   }
  // }

  // /** Check if a block includes a transaction */
  // public blockHasTransaction = (block: BlockTransactionString, transactionId: string): boolean => {
  //   const { transactions } = block
  //   const result = transactions?.includes(transactionId)
  //   return !!result
  // }

  /** Submits the transaction to the chain and waits only until it gets a transaction id
   * Does not wait for the transaction to be finalized on the chain
   */
  async sendTransactionWithoutWaitingForConfirm(signedTransaction: string) {
    try {
      const { txId: transactionId } = await this._algo.sendRawTransaction(signedTransaction)
      return transactionId
    } catch (error) {
      // ALGO TODO: map chain error
      throw new Error()
    }
  }

  async waitForTransactionConfirmation(transactionId: string) {
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const pendingTransaction = await this._algo.pendingTransactionInformation(transactionId)
      if (pendingTransaction.round != null && pendingTransaction.round > 0) {
        // Got the completed Transaction
        break
      }
    }
  }

  /** Broadcast a signed transaction to the chain
  /* if ConfirmType.None, returns the transaction hash without waiting for further tx receipt
  /* if ConfirmType.After001, waits for the transaction to finalize on chain and then returns the tx receipt
  */
  // async sendTransaction(
  //   signedTransaction: string,
  //   waitForConfirm: ConfirmType = ConfirmType.None,
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   communicationSettings?: AlgorandChainSettingsCommunicationSettings,
  // ): Promise<AlgorandTxResult> {
  //   const sendResult: Partial<AlgorandTxResult> = {}

  //   if (waitForConfirm !== ConfirmType.None && waitForConfirm !== ConfirmType.After001) {
  //     throwNewError('Only ConfirmType.None or .After001 are currently supported for waitForConfirm parameters')
  //   }

  //   try {
  //     // returns transactionHash after submitting transaction does NOT wait for confirmation from chain
  //     if (waitForConfirm === ConfirmType.None) {
  //       const transactionId = (await this.sendTransactionWithoutWaitingForConfirm(signedTransaction)) as string
  //       sendResult.chainResponse = null
  //       sendResult.transactionId = transactionId
  //     }
  //     // returns transactionReceipt after submitting transaction AND waiting for a confirmation
  //     if (waitForConfirm === ConfirmType.After001) {
  //       const transactionId = await this._algo.sendRawTransaction(signedTransaction)
  //       await waitForTransactionConfirmation(transactionId)
  //       const chainResponse = await this._algo.getTransactionCount()
  //       sendResult.transactionId = sendResult?.chainResponse?.transactionHash
  //     }
  //   } catch (error) {
  //     const chainError = mapChainError(error, ChainFunctionCategory.Transaction)
  //     throw chainError
  //   }

  //   return sendResult as EthereumTxResult
  // }

  /** Return instance of Web3js API */
  public get algo(): Algo {
    this.assertIsConnected()
    return this._algo
  }
}
