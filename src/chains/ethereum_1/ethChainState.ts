import Web3 from 'web3'
import BN from 'bn.js'
import { Contract } from 'web3-eth-contract'
import { HttpProviderOptions } from 'web3-core-helpers'
import { BlockTransactionString, TransactionReceipt } from 'web3-eth'
import { rejectAwaitTransaction, resolveAwaitTransaction, throwNewError, throwAndLogError } from '../../errors'
import { ChainErrorDetailCode, ChainErrorType, ChainSettingsCommunicationSettings, ConfirmType } from '../../models'
import { bigNumberToString, ensureHexPrefix, isNullOrEmpty, objectHasProperty, trimTrailingChars } from '../../helpers'
import { mapChainError } from './ethErrors'
import { ChainState } from '../../interfaces/chainState'
import {
  ChainFunctionCategory,
  EthereumAddress,
  EthereumBlockNumber,
  EthereumBlockType,
  EthereumChainEndpoint,
  EthereumChainInfo,
  EthereumChainSettings,
  EthereumSymbol,
  EthereumTxResult,
  EthereumTxChainResponse,
} from './models'
import { erc20Abi } from './templates/abis/erc20Abi'
import {
  DEFAULT_BLOCKS_TO_CHECK,
  DEFAULT_CHECK_INTERVAL,
  DEFAULT_GET_BLOCK_ATTEMPTS,
  NATIVE_CHAIN_TOKEN_SYMBOL,
} from './ethConstants'

//   blockIncludesTransaction() {}; // hasTransaction
//   getContractTableRows() {}; // getAllTableRows

export class EthereumChainState implements ChainState {
  private ethChainInfo: BlockTransactionString

  private _activeEndpoint: EthereumChainEndpoint

  private _chainInfo: EthereumChainInfo

  private _chainSettings: EthereumChainSettings

  private _endpoints: EthereumChainEndpoint[]

  private _isConnected: boolean = false

  private _web3: Web3 // Ethereum chain api endpoint

  constructor(endpoints: EthereumChainEndpoint[], settings?: EthereumChainSettings) {
    this._endpoints = endpoints
    this._chainSettings = settings
  }

  /** Return chain URL endpoints */
  public get activeEndpoint(): EthereumChainEndpoint {
    return this._activeEndpoint
  }

  /** * Return chain ID */
  public get chainId(): string {
    this.assertIsConnected()
    return this._chainInfo?.nativeInfo?.chainId.toString()
  }

  /** Return chain info - e.g. head block number */
  public get chainInfo(): EthereumChainInfo {
    this.assertIsConnected()
    return this._chainInfo
  }

  /** Return chain settings */
  public get chainSettings(): EthereumChainSettings {
    return this._chainSettings
  }

  /** Return chain URL endpoints */
  public get endpoints(): EthereumChainEndpoint[] {
    return this._endpoints
  }

  /** Whether any information has been retrieved from the chain yet
   *   A value here confirms that the network is working
   * */
  public get isConnected(): boolean {
    return this._isConnected
  }

  /**  * Connect to chain endpoint to verify that it is operational and to get latest block info */
  public async connect(): Promise<void> {
    try {
      if (!this._web3) {
        const { url, endpoint } = this.selectEndpoint()
        this._activeEndpoint = endpoint
        const httpProviderOptions = this.mapOptionsToWeb3HttpProviderOptions(endpoint)
        const web3HttpProvider = new Web3.providers.HttpProvider(url, httpProviderOptions)
        this._web3 = new Web3(web3HttpProvider)
      }
      await this.getChainInfo()
      this._isConnected = true
    } catch (error) {
      throwAndLogError('Problem connecting to chain', 'chainConnectFailed', error)
    }
  }

  /** Map endpoint options to web3 HttpProviderOptions type */
  public mapOptionsToWeb3HttpProviderOptions(endpoint: EthereumChainEndpoint): HttpProviderOptions {
    const headers: { name: string; value: string }[] = []
    // convert [{'Header-Name':'headervalue'}] => [{name:'Header-Name', value:'headervalue'}]
    endpoint.options?.headers.forEach(header => {
      const key = Object.keys(header)[0]
      headers.push({ name: key, value: header[key] })
    })
    const webOptions: HttpProviderOptions = {
      ...endpoint.options,
      headers,
    }
    return webOptions
  }

  /** Retrieve lastest chain info including head block number and time */
  public async getChainInfo(): Promise<EthereumChainInfo> {
    const info = await this._web3.eth.getBlock(EthereumBlockType.Latest)
    const { gasLimit, gasUsed, number, timestamp } = info
    const chainId = await this._web3.eth.getChainId()
    try {
      const nodeInfo = await this._web3.eth.getNodeInfo()
      const currentGasPrice = await this.getCurrentGasPriceFromChain()
      this._chainInfo = {
        headBlockNumber: number,
        headBlockTime: new Date(timestamp),
        // Node information contains version example: 'Geth/v1.9.9-omnibus-e320ae4c-20191206/linux-amd64/go1.13.4'
        version: nodeInfo,
        nativeInfo: { chainId, gasLimit, gasUsed, currentGasPrice },
      }
      return this._chainInfo
    } catch (error) {
      const chainError = mapChainError(error, ChainFunctionCategory.ChainState)
      throw chainError
    }
  }

  // TODO: sort based on health info
  /** Choose the best Chain endpoint based on health and response time */
  private selectEndpoint(): { url: string; endpoint: EthereumChainEndpoint } {
    // Just choose the first endpoint for now
    const selectedEndpoint = this.endpoints[0]
    const endpointUrl = new URL(selectedEndpoint.url)
    return { url: trimTrailingChars(endpointUrl?.href, '/'), endpoint: selectedEndpoint }
  }

  /** Retrieve a specific block from the chain */
  public async getBlock(blockNumber: EthereumBlockNumber): Promise<BlockTransactionString> {
    try {
      this.assertIsConnected()
      const block = await this._web3.eth.getBlock(blockNumber)
      // getBlock function of web3 doesnt throw if block does not exist
      if (isNullOrEmpty(block)) {
        const blockDoesNotExistError = mapChainError(
          new Error(`Block ${blockNumber} does not exist`),
          ChainFunctionCategory.Block,
        )
        throw blockDoesNotExistError
      }
      return block
    } catch (error) {
      const chainError = mapChainError(error, ChainFunctionCategory.Block)
      throw chainError
    }
  }

  /** Retrieve a the current price of gas from the chain in units of Wei */
  async getCurrentGasPriceFromChain(): Promise<string> {
    try {
      const gasPrice = await this._web3.eth.getGasPrice()
      return gasPrice
    } catch (error) {
      const chainError = mapChainError(error, ChainFunctionCategory.ChainState)
      throw chainError
    }
  }

  /** Confirm that we've connected to the chain - throw if not */
  public assertIsConnected(): void {
    if (!this._isConnected) {
      throwNewError('Not connected to chain')
    }
  }

  /** Get transaction count for an address
   *  Useful to calculate transaction nonce propery */
  public async getTransactionCount(address: EthereumAddress, defaultBlock: EthereumBlockNumber): Promise<number> {
    try {
      return await this._web3.eth.getTransactionCount(ensureHexPrefix(address), defaultBlock)
    } catch (error) {
      const chainError = mapChainError(error, ChainFunctionCategory.Transaction)
      throw chainError
    }
  }

  /** Fetches data from a contract table */
  fetchContractData(): Promise<any> {
    throw new Error('Not Implemented')
  }

  /** Fetches data from a contract table */
  fetchContractTable(): Promise<any> {
    throw new Error('Not Implemented')
  }

  /** Get the balance for an account from the chain
   *  If tokenAddress is provided, returns balance for ERC20 token
   *  If symbol = 'eth', returns Eth balance (in units of Ether)
   *  Returns a string representation of the value to accomodate large numbers */
  public async fetchBalance(
    account: EthereumAddress,
    symbol: EthereumSymbol,
    tokenAddress?: EthereumAddress,
  ): Promise<{ balance: string }> {
    // Get balance for Eth
    if ((symbol || '').toLowerCase() === NATIVE_CHAIN_TOKEN_SYMBOL.toLowerCase()) {
      return { balance: await this.getEthBalance(account) }
    }
    if (isNullOrEmpty(tokenAddress)) {
      throw Error('Must provide an ERC20 token contract address')
    }
    // Get balance for ERC20 token
    const abi = erc20Abi
    const erc20Contract = new this.web3.eth.Contract(abi, tokenAddress.toString())
    if (isNullOrEmpty(erc20Contract)) {
      throw Error(`Cannot find ERC20 token contract at tokenAddress: ${tokenAddress}`)
    }

    const { balance, tokenSymbol } = await this.getErc20TokenBalance(erc20Contract, account)

    if (tokenSymbol && (symbol || '').toLowerCase() !== (tokenSymbol || '').toLowerCase()) {
      throw Error(`Different token symbol found at: ${tokenAddress}. Found symbol:${tokenSymbol} instead of:${symbol}`)
    }

    return { balance }
  }

  /** Utilizes native web3 method to get ETH token balance for an account (in Ether) */
  public async getEthBalance(address: EthereumAddress): Promise<string> {
    const result = await this.web3.eth.getBalance(address.toString())
    if (isNullOrEmpty(result)) {
      throw Error(`Cannot find balance for account address ${address}`)
    }

    const balance = this.web3.utils.fromWei(result, 'ether')
    return balance
  }

  /** Retrieve account balance and other info from ERC20 contract */
  public async getErc20TokenBalance(
    contract: Contract,
    account: EthereumAddress,
  ): Promise<{ balance: string; tokenName?: string; tokenSymbol?: string }> {
    let balanceString = '0.0000'
    const balance: BN = this.isMethodCallable(contract, 'balanceOf')
      ? await contract?.methods?.balanceOf(account)?.call()
      : null
    const decimals = this.isMethodCallable(contract, 'decimals') ? await contract?.methods?.decimals()?.call() : null
    const tokenName = this.isMethodCallable(contract, 'name') ? await contract?.methods?.name()?.call() : null
    const tokenSymbol = this.isMethodCallable(contract, 'symbol') ? await contract?.methods?.symbol()?.call() : null

    if (balance && decimals) {
      balanceString = bigNumberToString(balance, decimals)
    }

    /** Returns 0.0000 if no balance found for token contract */
    return { balance: balanceString, tokenName, tokenSymbol }
  }

  /** Whether a callable method exists on an ethereum contract */
  public isMethodCallable(contract: Contract, methodName: string): boolean {
    const methods = contract?.methods
    if (objectHasProperty(methods, methodName) && objectHasProperty(methods[methodName], 'call')) {
      return true
    }
    return false
  }

  /** Return a transaction if its included in a block */
  public findBlockInTransaction = (
    block: BlockTransactionString,
    transactionId: string,
  ): Promise<TransactionReceipt> => {
    const { transactions } = block
    const result = transactions?.find((transaction: any) => transaction === transactionId)
    if (isNullOrEmpty(result)) {
      return null
    }
    return this.getTransactionById(result)
  }

  /** Submits the transaction to the chain and waits only until it gets a transaction hash
   * Does not wait for the transaction to be finalized on the chain
   */
  sendTransactionWithoutWaitingForConfirm(signedTransaction: string) {
    return new Promise((resolve, reject) => {
      this._web3.eth
        .sendSignedTransaction(signedTransaction)
        .once('transactionHash', hash => {
          resolve(hash)
        })
        .on('error', err => {
          reject(err)
        })
    })
  }

  /** Retrieve the default settings for chain communications */
  static get defaultCommunicationSettings() {
    return {
      blocksToCheck: DEFAULT_BLOCKS_TO_CHECK,
      checkInterval: DEFAULT_CHECK_INTERVAL,
      getBlockAttempts: DEFAULT_GET_BLOCK_ATTEMPTS,
    }
  }

  /** Broadcast a signed transaction to the chain
  /* if ConfirmType.None, returns the transaction hash without waiting for further tx receipt
  /* if ConfirmType.After001, waits for the transaction to finalize on chain and then returns the tx receipt
  */
  async sendTransaction(
    signedTransaction: string,
    waitForConfirm: ConfirmType = ConfirmType.None,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    communicationSettings?: ChainSettingsCommunicationSettings,
  ): Promise<EthereumTxResult> {
    if (waitForConfirm !== ConfirmType.None && waitForConfirm !== ConfirmType.After001) {
      throwNewError('Only ConfirmType.None or .After001 are currently supported for waitForConfirm parameters')
    }

    let sendResult: EthereumTxResult
    let transactionId: string

    try {
      const transactionHash = (await this.sendTransactionWithoutWaitingForConfirm(signedTransaction)) as string
      transactionId = transactionHash
    } catch (error) {
      const chainError = mapChainError(error, ChainFunctionCategory.Transaction)
      throw chainError
    }
    if (waitForConfirm !== ConfirmType.None) {
      // get the head block just before sending the transaction
      const { headBlockNumber: currentHeadBlock } = await this.getChainInfo()
      // Since it wont retrieve transaction response from ethereum (unlike EOS) it will automatically start with currentHeadBlock
      const startFromBlockNumber = currentHeadBlock

      sendResult = await this.awaitTransaction(
        { transactionId } as EthereumTxResult,
        waitForConfirm,
        startFromBlockNumber,
        communicationSettings,
      )
    }

    return { transactionId, ...sendResult } as EthereumTxResult
  }

  private async awaitTransaction(
    transactionResult: EthereumTxResult,
    waitForConfirm: ConfirmType,
    startFromBlockNumber: number,
    communicationSettings: ChainSettingsCommunicationSettings,
  ): Promise<EthereumTxResult> {
    // use default communicationSettings or whatever was passed-in in as chainSettings (via constructor)
    const useCommunicationSettings = communicationSettings ?? {
      ...EthereumChainState.defaultCommunicationSettings,
      ...this.chainSettings?.communicationSettings,
    }
    const { blocksToCheck, checkInterval, getBlockAttempts: maxBlockReadAttempts } = useCommunicationSettings
    if (waitForConfirm !== ConfirmType.None && waitForConfirm !== ConfirmType.After001) {
      throwNewError(`Specified ConfirmType ${waitForConfirm} not supported`)
    }
    if (!startFromBlockNumber || startFromBlockNumber <= 1) {
      throwNewError('A valid number (greater than 1) must be provided for startFromBlockNumber param')
    }
    return new Promise((resolve, reject) => {
      const getBlockAttempt = 1
      const { transactionId } = transactionResult || {}
      // starting block number should be the block number in the transaction receipt. If block number not in transaction, use preCommitHeadBlockNum
      const nextBlockNumToCheck = startFromBlockNumber - 1

      // Schedule first call of recursive function
      // if will keep reading blocks from the chain (every checkInterval) until we find the transationId in a block
      // ... or until we reach a max number of blocks or block read attempts
      setTimeout(
        async () =>
          this.checkIfAwaitConditionsReached(
            reject,
            resolve,
            blocksToCheck,
            checkInterval,
            getBlockAttempt,
            maxBlockReadAttempts,
            nextBlockNumToCheck,
            startFromBlockNumber,
            null,
            transactionId,
            transactionResult,
            waitForConfirm,
          ),
        checkInterval,
      )
    })
  }

  /** While processing awaitTransaction, check if we've reached our limits to wait
   *  Otherwise, schedule next check  */
  private async checkIfAwaitConditionsReached(
    reject: (value?: unknown) => void,
    resolve: (value?: unknown) => void,
    blocksToCheck: number,
    checkInterval: number,
    getBlockAttempt: number,
    maxBlockReadAttempts: number,
    blockNumToCheck: number,
    startFromBlockNumber: number,
    transactionBlockNumberParam: number,
    transactionId: string,
    transactionResult: EthereumTxResult,
    waitForConfirm: ConfirmType,
  ) {
    let transactionBlockNumber = transactionBlockNumberParam
    let nextGetBlockAttempt: number
    let nextBlockNumToCheck = blockNumToCheck
    let possibleTransactionBlock: any
    let transactionResponse: EthereumTxChainResponse
    try {
      if (!transactionBlockNumber) {
        possibleTransactionBlock = await this.getBlock(blockNumToCheck)
      }

      transactionResponse = await this.findBlockInTransaction(possibleTransactionBlock, transactionId)
      if (!isNullOrEmpty(transactionResponse)) {
        transactionBlockNumber = possibleTransactionBlock?.number
      }
      // check if we've met our limit rules
      const hasReachedConfirmLevel = await this.hasReachedConfirmLevel(
        transactionBlockNumber,
        waitForConfirm,
        // blocksToCheck,
      )
      if (hasReachedConfirmLevel) {
        resolveAwaitTransaction(resolve, {
          chainResponse: transactionResponse,
          ...transactionResult,
        } as EthereumTxResult)
        return
      }
      nextBlockNumToCheck = blockNumToCheck + 1
    } catch (error) {
      const mappedError = mapChainError(error)
      if (mappedError.errorType === ChainErrorType.BlockDoesNotExist) {
        // Try to read the specific block - up to getBlockAttempts times
        if (getBlockAttempt >= maxBlockReadAttempts) {
          rejectAwaitTransaction(
            reject,
            ChainErrorDetailCode.MaxBlockReadAttemptsTimeout,
            `Await Transaction Failure: Failure to find a block, after ${getBlockAttempt} attempts to check block ${blockNumToCheck}.`,
            error,
          )
          return
        }
        nextGetBlockAttempt = getBlockAttempt + 1
      } else {
        // re-throw error - not one we can handle here
        throw mappedError
      }
    }

    if (nextBlockNumToCheck && nextBlockNumToCheck > startFromBlockNumber + blocksToCheck) {
      rejectAwaitTransaction(
        reject,
        ChainErrorDetailCode.ConfirmTransactionTimeout,
        `Await Transaction Timeout: Waited for ${blocksToCheck} blocks ~(${(checkInterval / 1000) *
          blocksToCheck} seconds) starting with block num: ${startFromBlockNumber}. This does not mean the transaction failed just that the transaction wasn't found in a block before timeout`,
        null,
      )
      return
    }
    // not yet reached limit - set a timer to call this function again (in checkInterval ms)
    const checkAgainInMs = checkInterval
    setTimeout(
      async () =>
        this.checkIfAwaitConditionsReached(
          reject,
          resolve,
          blocksToCheck,
          checkInterval,
          nextGetBlockAttempt,
          maxBlockReadAttempts,
          nextBlockNumToCheck,
          startFromBlockNumber,
          transactionBlockNumber,
          transactionId,
          transactionResult,
          waitForConfirm,
        ),
      checkAgainInMs,
    )
  }

  /** block has reached the confirmation level requested */
  hasReachedConfirmLevel = async (transactionBlockNumber: number, waitForConfirm: ConfirmType): Promise<boolean> => {
    // check that we've reached the required number of confirms
    switch (waitForConfirm) {
      case ConfirmType.None:
        return true
      case ConfirmType.After001:
        // confirmed at least once if in a block
        return !!transactionBlockNumber
      case ConfirmType.After007:
        throw new Error('Not Implemented')
      case ConfirmType.After010:
        throw new Error('Not Implemented')
      case ConfirmType.Final:
        throw new Error('Not Implemented')
      default:
        return false
    }
  }

  public async getTransactionById(id: string): Promise<TransactionReceipt> {
    return this.web3.eth.getTransactionReceipt(id)
  }

  /** Return instance of Web3js API */
  public get web3(): Web3 {
    this.assertIsConnected()
    return this._web3
  }
}
