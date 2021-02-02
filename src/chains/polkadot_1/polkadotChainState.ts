import { throwAndLogError, throwNewError } from '../../errors'
import { PolkadotBlockHash, PolkadotChainEndpoint, PolkadotChainInfo, PolkadotChainSettings } from './models'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { isNullOrEmpty, trimTrailingChars } from '../../helpers'

export class PolkadotChainState {
	private _chainInfo: PolkadotChainInfo

	private _chainSettings: PolkadotChainSettings
	
	private _endpoints: PolkadotChainEndpoint[]

	private _activeEndpoint: PolkadotChainEndpoint

	private _isConnected: boolean = false
	
	private _api: ApiPromise

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
			if (!this._api) {
				const { url, endpoint } = this.selectEndpoint()
				this._activeEndpoint = endpoint
				this._api = new ApiPromise({ provider: new WsProvider(url) })
				await this._api.isReady
			}
			await this.getChainInfo()
			this._isConnected = true
		} catch (error) {
			throwAndLogError('Problem connection to api', 'apiConnectFailed', error)
		}
	}

	private async createConnection(): Promise<void> {
		try {
			if (!this._api.isConnected) {
				await this._api.connect()
			}
		} catch (error) {
			throwAndLogError('Problem connection to chain', 'chainConnectFailed', error)
		}
	}

	private async purgeConnection(): Promise<void> {
		try {
			this._api?.disconnect()
		} catch (error) {
			throwAndLogError('Problem disconnection from chain', 'chainDisconnectFailed', error)
		}
	}

	public async getChainInfo(): Promise<PolkadotChainInfo> {
		try {
			await this.createConnection()
			const [chain, latestHeader] = await Promise.all([
				this._api.rpc.system.chain(),
				this._api.rpc.chain.getHeader(),
			])

			this._chainInfo = {
				headBlockNumber: latestHeader.number.toNumber(),
				headBlockHash: latestHeader.hash.toString(),
				nativeInfo: { 
					chain: chain.toString(),
					existentialDeposit: this._api.consts.balances.existentialDeposit.toNumber(),
					transactionByteFee: this._api.consts.transactionPayment.transactionByteFee.toNumber()
				}
			}
			await this.purgeConnection()
			return this._chainInfo
		} catch (error) {
			throwAndLogError('error', 'error', error)
		}
	}

	private selectEndpoint() : { url: string; endpoint: PolkadotChainEndpoint } {
		const selectedEndpoint = this.endpoints[0]
		const endpointUrl = new URL(selectedEndpoint.url)
		return { url: trimTrailingChars(endpointUrl?.href, '/'), endpoint: selectedEndpoint }
	}
	public assertIsConnected(): void {
		if (!this._isConnected) {
				throwNewError('Not connected to chain')
		}
	}
}