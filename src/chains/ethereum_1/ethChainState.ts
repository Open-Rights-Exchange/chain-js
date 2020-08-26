import Web3 from 'web3'
import BN from 'bn.js'
import { Contract } from 'web3-eth-contract'
import { HttpProviderOptions } from 'web3-core-helpers'
import { BlockTransactionString } from 'web3-eth'
import { throwNewError, throwAndLogError } from '../../errors'
import { ConfirmType } from '../../models'
import { trimTrailingChars, isNullOrEmpty } from '../../helpers'
import { mapChainError } from './ethErrors'
import {
  ChainFunctionCategory,
  EthereumAddress,
  EthereumBlockNumber,
  EthereumBlockType,
  EthereumChainEndpoint,
  EthereumChainInfo,
  EthereumChainSettings,
  EthereumChainSettingsCommunicationSettings,
  EthereumSymbol,
  EthereumTxResult,
  EthereumTxChainResponse,
} from './models'
import { ensureHexPrefix, bigNumberToString } from './helpers'
import { erc20Abi } from './templates/abis/erc20Abi'
import { NATIVE_CHAIN_SYMBOL } from './ethConstants'

//   blockIncludesTransaction() {}; // hasTransaction
//   getContractTableRows() {}; // getAllTableRows

export class EthereumChainState {
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
    const endpoint = this.endpoints[0]
    const url = endpoint?.url?.href
    return { url: trimTrailingChars(url, '/'), endpoint }
  }

  /** Retrieve a specific block from the chain */
  public async getBlock(blockNumber: EthereumBlockNumber): Promise<BlockTransactionString> {
    try {
      this.assertIsConnected()
      const block = await this._web3.eth.getBlock(blockNumber)
      return block
    } catch (error) {
      const chainError = mapChainError(error, ChainFunctionCategory.Block)
      throw chainError
    }
  }

  /** Retrieve a the current price of gas from the chain */
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
      return this._web3.eth.getTransactionCount(ensureHexPrefix(address), defaultBlock)
    } catch (error) {
      const chainError = mapChainError(error, ChainFunctionCategory.Transaction)
      throw chainError
    }
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
    if ((symbol || '').toLowerCase() === NATIVE_CHAIN_SYMBOL.toLowerCase()) {
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

    if ((symbol || '').toLowerCase() !== (tokenSymbol || '').toLowerCase()) {
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
    const balance: BN = await contract?.methods?.balanceOf(account)?.call()
    const decimals = await contract?.methods?.decimals()?.call()
    const tokenName = await contract?.methods?.name()?.call()
    const tokenSymbol = await contract?.methods?.symbol()?.call()

    if (balance && decimals) {
      balanceString = bigNumberToString(balance, decimals)
    }

    /** Returns 0.0000 if no balance found for token contract */
    return { balance: balanceString, tokenName, tokenSymbol }
  }

  /** Check if a block includes a transaction */
  public blockHasTransaction = (block: BlockTransactionString, transactionId: string): boolean => {
    const { transactions } = block
    const result = transactions?.includes(transactionId)
    return !!result
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

  /** Broadcast a signed transaction to the chain
  /* if ConfirmType.None, returns the transaction hash without waiting for further tx receipt
  /* if ConfirmType.After001, waits for the transaction to finalize on chain and then returns the tx receipt
  */
  async sendTransaction(
    signedTransaction: string,
    waitForConfirm: ConfirmType = ConfirmType.None,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    communicationSettings?: EthereumChainSettingsCommunicationSettings,
  ): Promise<EthereumTxResult> {
    const sendResult: Partial<EthereumTxResult> = {}

    if (waitForConfirm !== ConfirmType.None && waitForConfirm !== ConfirmType.After001) {
      throwNewError('Only ConfirmType.None or .After001 are currently supported for waitForConfirm parameters')
    }

    try {
      // returns transactionHash after submitting transaction does NOT wait for confirmation from chain
      if (waitForConfirm === ConfirmType.None) {
        const transactionHash = (await this.sendTransactionWithoutWaitingForConfirm(signedTransaction)) as string
        sendResult.chainResponse = null
        sendResult.transactionId = transactionHash
      }
      // returns transactionReceipt after submitting transaction AND waiting for a confirmation
      if (waitForConfirm === ConfirmType.After001) {
        sendResult.chainResponse = (await this._web3.eth.sendSignedTransaction(
          signedTransaction,
        )) as EthereumTxChainResponse
        sendResult.transactionId = sendResult?.chainResponse?.transactionHash
      }
    } catch (error) {
      const chainError = mapChainError(error, ChainFunctionCategory.Transaction)
      throw chainError
    }

    return sendResult as EthereumTxResult
  }

  /** Return instance of Web3js API */
  public get web3(): Web3 {
    this.assertIsConnected()
    return this._web3
  }
}
