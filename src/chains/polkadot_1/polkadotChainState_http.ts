import { throwAndLogError, throwNewError } from '../../errors'
import { PolkadotBlock, PolkadotBlockNumber, PolkadotChainEndpoint, PolkadotChainInfo, PolkadotChainSettings } from './models'
import { ApiPromise } from '@polkadot/api'
import { HttpProvider } from '@polkadot/rpc-provider'
import { trimTrailingChars } from '../../helpers'
import { AnyTuple } from '@polkadot/types/types'
import { GenericExtrinsic } from '@polkadot/types'

export class PolkadotChainState {
	private _chainInfo: PolkadotChainInfo

	private _chainSettings: PolkadotChainSettings
	
	private _endpoints: PolkadotChainEndpoint[]

	private _activeEndpoint: PolkadotChainEndpoint

	private _isConnected: boolean = false

	private _isReady: boolean = false
	
	private _provider: HttpProvider

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

	public get chainSettings(): PolkadotChainSettings {
		return this._chainSettings
	}
	
	public get endpoints(): PolkadotChainEndpoint[] {
		return this._endpoints
	}

	public get isConnected(): boolean {
		return this._isConnected
	}

	public async connect(): Promise<void> {
		try {
			if (!this._provider) {
				const { url, endpoint } = this.selectEndpoint()
				this._activeEndpoint = endpoint
				const httpProviderOptions = this.mapOptionsToHttpProviderOption(endpoint)
				this._provider = new HttpProvider(url, httpProviderOptions)
			}
			await this.getChainInfo()
			this._isConnected = true
		} catch (error) {
			throwAndLogError('Problem connecting to chain provider', 'chainProviderConnectFailed', error)
		}
	}

	public mapOptionsToHttpProviderOption(endpoint: PolkadotChainEndpoint): Record<string, string> {
		const headers : Record<string, string> = {}
		const headerObj = Object(endpoint.options?.headers)
		Object.keys(headerObj).forEach(key => {
			headers[key] = headerObj[key]
		})
		return headers;
	}

	public async getChainInfo(): Promise<PolkadotChainInfo> {
		try {
			const [chain, version, latestBlockHead, latestBlockHash] = await Promise.all([
				this._provider.send('system_chain', []),
				this._provider.send('system_version', []),
				this._provider.send('chain_getHeader', []),
				this._provider.send('chain_getBlockHash', []),
			])
			const res = await this._provider.send('chain_getBlock', [latestBlockHash])
			let api = await this.createApi()
			const block = api.createType('SignedBlock', res)
			const extrinsics: GenericExtrinsic<AnyTuple>[] = block.block.extrinsics.toArray()
			const timestamp: string = extrinsics.map(extrinsic => {
				const typedExt = extrinsic.toHuman()
				const jsonExt = JSON.parse(JSON.stringify(typedExt))
				if (jsonExt?.method?.section == 'timestamp') {
					return jsonExt.method.args[0]
				}
				return ''
			}).reduce((pV, cV) => pV != '' ? pV : cV, '')			
			this._chainInfo = {
				headBlockNumber: parseInt((latestBlockHead?.number | 0).toString()),
				headBlockTime: new Date( parseInt(timestamp.split(',').join('')) ),
				version,
				nativeInfo: { 
					chain: chain.toString(),
				}
			}
			this.removeApi(api)

			return this._chainInfo
		} catch (error) {
			throwAndLogError('error', 'error', error)
		}
	}

	private createApi(): Promise<ApiPromise> {
		return ApiPromise.create({provider: new HttpProvider('https://rpc.polkadot.io')})
	}

	private async removeApi(api: ApiPromise): Promise<void> {
		api?.disconnect()
	}
	
	private selectEndpoint() : { url: string; endpoint: PolkadotChainEndpoint } {
		const selectedEndpoint = this.endpoints[0]
		const endpointUrl = new URL(selectedEndpoint.url)
		return { url: trimTrailingChars(endpointUrl?.href, '/'), endpoint: selectedEndpoint }
	}
	
	public async getBlock(blockNumber: PolkadotBlockNumber): Promise<PolkadotBlock> {
		try {
			this.assertIsConnected()
			const blockHash = await this._provider.send('chain_getBlockHash', [blockNumber])
			const block = await this._provider.send('chain_getBlock', [blockHash])
			let api = await this.createApi()
			const enBlock = api.createType('SignedBlock', block)
			this.removeApi(api)

			return enBlock.toHuman()
		} catch (error) {
			throw error
		}
	}

	public async getTransactionCount(): Promise<void> {

	}

	public async fetchBalance(): Promise<void> {

	}

	public assertIsConnected(): void {
		if (!this._isConnected) {
			throwNewError('Not connected to chain')
		}
	}
}