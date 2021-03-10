import { ApiPromise, WsProvider } from '@polkadot/api'
// import { isU8a, u8aToString } from '@polkadot/util'
import { SubmittableExtrinsic } from '@polkadot/api/submittable/types'
import { ChainFeature } from '../../models'
import {
  PolkadotBlock,
  PolkadotBlockNumber,
  PolkadotChainEndpoint,
  PolkadotChainInfo,
  PolkadotChainSettings,
  PolkadotAddress,
  PolkadotPaymentInfo,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  PolkadotAccountBalance,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  PolkadotHash,
  PolkadotKeyringPair,
  PolkadotSymbol,
} from './models'
import { notImplemented, trimTrailingChars } from '../../helpers'
import { throwAndLogError, throwNewError } from '../../errors'

export class PolkadotChainState {
  private _chainInfo: PolkadotChainInfo

  private _chainSettings: PolkadotChainSettings

  private _endpoints: PolkadotChainEndpoint[]

  private _activeEndpoint: PolkadotChainEndpoint

  private _isConnected: boolean = false

  private _api: ApiPromise

  private _provider: WsProvider

  constructor(endpoints: PolkadotChainEndpoint[], settings?: PolkadotChainSettings) {
    this._endpoints = endpoints
    this._chainSettings = settings
  }

  public get activeEndpoint(): PolkadotChainEndpoint {
    return this._activeEndpoint
  }

  public get chain(): string {
    this.assertIsConnected()
    return this._chainInfo?.nativeInfo?.chain.toString()
  }

  public get chainInfo(): PolkadotChainInfo {
    this.assertIsConnected()
    return this._chainInfo
  }

  public get isConnected(): boolean {
    return this._isConnected
  }

  public get endpoints(): PolkadotChainEndpoint[] {
    return this._endpoints
  }

  public async connect(): Promise<void> {
    try {
      if (!this._provider) {
        const { url, endpoint } = this.selectEndpoint()
        this._activeEndpoint = endpoint
        this._provider = new WsProvider(url)
      }
      if (!this._api) {
        this._api = await ApiPromise.create({ provider: this._provider })
      }

      await this.getChainInfo()
      this._isConnected = true
    } catch (error) {
      throwAndLogError('Problem connection to api', 'apiConnectFailed', error)
    }
  }

  /** map our chain features names to polkadot metadata module name */
  mapFeatureToMetadataModuleName(feature: ChainFeature) {
    switch (feature) {
      case ChainFeature.Account:
        return 'Account'
      case ChainFeature.AccountCreationTransaction:
        return 'Account'
      case ChainFeature.Multisig:
        return 'Multisig'
      case ChainFeature.TransactionFees:
        return 'TransactionPayment'
      default:
        return null
    }
  }

  /** get the module metadata for a named module */
  getMetadataModule(moduleName: string) {
    // TODO: update to use types for PolkadotMetadata
    return this.metadata?.V12?.modules.find((m: any) => m.name.toLowercase() === moduleName)
  }

  /** Whether the current parachain has a specific feautre/module installed */
  public hasFeature(feature: ChainFeature): boolean {
    const moduleName = this.mapFeatureToMetadataModuleName(feature)
    return !!this.getMetadataModule(moduleName)
  }

  get metadata() {
    return this.chainInfo?.nativeInfo?.metadata
  }

  public async getChainInfo(): Promise<PolkadotChainInfo> {
    try {
      const [headBlockTime, chain, name, version, lastBlockHead, metadata] = await Promise.all([
        this._api.query.timestamp.now(),
        this._api.rpc.system.chain(),
        this._api.rpc.system.name(),
        this._api.rpc.system.version(),
        this._api.rpc.chain.getHeader(),
        this._api.rpc.state.getMetadata(),
      ])
      this._chainInfo = {
        headBlockNumber: lastBlockHead.number.toNumber(),
        headBlockTime: new Date(headBlockTime.toNumber()),
        version: version.toString(),
        nativeInfo: {
          chain: chain.toString(),
          name: name.toString(),
          transacitonByteFee: this._api.consts.transactionPayment.transactionByteFee.toNumber(),
          tokenDecimals: this._api.registry.chainDecimals,
          SS58: this._api.registry.chainSS58,
          tokenSymbols: this._api.registry.chainTokens,
          metadata: metadata.toHuman(),
        },
      }
    } catch (error) {
      throwAndLogError('error', 'error', error)
    }
    return this._chainInfo
  }

  private selectEndpoint(): { url: string; endpoint: PolkadotChainEndpoint } {
    const selectedEndpoint = this.endpoints[0]
    const endpointUrl = new URL(selectedEndpoint.url)
    return { url: trimTrailingChars(endpointUrl?.href, '/'), endpoint: selectedEndpoint }
  }

  public async getBlock(blockNumber: PolkadotBlockNumber): Promise<PolkadotBlock> {
    const blockHash = await this._api.rpc.chain.getBlockHash(blockNumber)
    const block = await this._api.rpc.chain.getBlock(blockHash)
    return block.toHuman()
  }

  public async fetchBalance(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    address: PolkadotAddress,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    symbol: PolkadotSymbol,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tokenAddress?: PolkadotAddress,
  ): Promise<{ balance: string }> {
    notImplemented()
    return null
    // const balanceInfo = await this.getBalance(isU8a(address) ? u8aToString(address) : address)
    // const balance = balanceInfo.free.sub(balanceInfo.miscFrozen)
    // return { balance: balance.toString() }
  }

  // public async getBalance(address: string): Promise<PolkadotAccountBalance> {
  //   const { data } = await this._api.query.system.account(address)

  //   return data
  // }

  public async estimateTxFee(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sender: PolkadotKeyringPair,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    extrinsics: SubmittableExtrinsic<'promise'>,
  ): Promise<PolkadotPaymentInfo> {
    notImplemented()
    return null
    // const info = await extrinsics.paymentInfo(sender)

    // const paymentInfo: PolkadotPaymentInfo = {
    //   weight: info.weight,
    //   partialFee: info.partialFee,
    // }

    // return paymentInfo
  }
  // public async estimateTxFee(sender: PolkadotKeyringPair, receiver: PolkadotAddress, amount: DotAmount): Promise<PolkadotPaymentInfo> {
  // 	try {
  // 		const info = await this._api.tx.balances.transfer(receiver, amount)
  // 																						.paymentInfo(sender)

  // 		const paymentInfo: PolkadotPaymentInfo = {
  // 			weight: info.weight,
  // 			partialFee: info.partialFee
  // 		}

  // 		return paymentInfo
  // 	} catch (error) {
  // 		throw error
  // 	}
  // }

  // public async sendTransaction(
  //   sender: PolkadotKeyringPair,
  //   extrinsics: SubmittableExtrinsic<'promise'>,
  // ): Promise<PolkadotHash> {
  //   const txHash = await extrinsics.signAndSend(sender)
  //   return txHash
  // }

  // public async sendTransaction(sender: PolkadotKeyringPair, receiver: PolkadotAddress, amount: DotAmount): Promise<PolkadotHash> {
  // 	try{
  // 		const tx = await this._api.tx.balances.transfer(receiver, amount)
  // 		const paymentInfo = await tx.paymentInfo(sender)
  // 		const fee = paymentInfo.partialFee.toString()
  // 		const balanceInfo = await this.getBalance(sender.address)
  // 		const balance = balanceInfo.free.sub(balanceInfo.miscFrozen)

  // 		const bnFee = new BigNumber(fee, this._chainInfo.nativeInfo.tokenDecimals[0])
  // 		const bnAmount = new BigNumber(amount.toString(), this._chainInfo.nativeInfo.tokenDecimals[0])
  // 		const bnBalance = new BigNumber(balance.toString(), this._chainInfo.nativeInfo.tokenDecimals[0])

  // 		if (bnFee.plus(bnAmount).isGreaterThan(bnBalance) ) {
  // 			throw new Error('Insufficient balance')
  // 		}

  // 		const txHash = await tx.signAndSend(sender)
  // 		return txHash
  // 	} catch (error) {
  // 		throw error
  // 	}
  // }

  // public async submitExtrinsics() {
  //   // Submittable createSubmittable()
  // }

  // public buildExtrinsics(section: string, method: string) {
  //   const sectionOptions = this.extrinsicSectionOptions()
  //   if (!sectionOptions.filter(option => option === section).length) {
  //     throwNewError('Not available Extrinsic Section Option')
  //   }
  //   const methodOptions = this.extrinsicMethodOptions(section)
  //   if (!methodOptions.filter(option => option === method).length) {
  //     throwNewError('Not available Extrinsic Method Option')
  //   }
  //   const fn: SubmittableExtrinsicFunction<'promise'> = this._api.tx[section][method]
  //   console.log(this.getParams(fn))
  // }

  // public extrinsicSectionOptions(): string[] {
  //   return Object.keys(this._api.tx)
  //     .sort()
  //     .filter((name): number => Object.keys(this._api.tx[name]).length)
  //     .map((name): string => name)
  // }

  // public extrinsicMethodOptions(sectionName: string): string[] {
  //   const section = this._api.tx[sectionName]
  //   return Object.keys(section)
  //     .sort()
  //     .map((name): string => name)
  // }

  // public getParams({ meta }: SubmittableExtrinsicFunction<'promise'>): { name: string; type: TypeDef }[] {
  //   return GenericCall.filterOrigin(meta).map((arg): { name: string; type: TypeDef } => ({
  //     name: arg.name.toString(),
  //     type: getTypeDef(arg.type.toString()),
  //   }))
  // }

  public assertIsConnected(): void {
    if (!this._isConnected) {
      throwNewError('Not connected to chain')
    }
  }
}
