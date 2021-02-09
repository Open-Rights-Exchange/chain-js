import { 
	PolkadotBlock, 
	PolkadotBlockNumber, 
	PolkadotChainEndpoint, 
	PolkadotChainInfo, 
	PolkadotChainSettings, 
	PolkadotAddress, 
	PolkadotPaymentInfo, 
	PolkadotAccountBalance, 
	PolkadotHash, 
	PolkadotKeyringPair, 
	DotAmount, 
} from './models'
import { trimTrailingChars } from '../../helpers'
import { throwAndLogError, throwNewError } from '../../errors'
import BigNumber from 'bignumber.js'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { isU8a, u8aToString } from '@polkadot/util';

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

	public async getChainInfo(): Promise<PolkadotChainInfo> {
		try {
			const [headBlockTime, chain, version, lastBlockHead] = await Promise.all([
				this._api.query.timestamp.now(),
				this._api.rpc.system.chain(),
				this._api.rpc.system.version(),
				this._api.rpc.chain.getHeader(),
			])

			this._chainInfo = {
				headBlockNumber: lastBlockHead.number.toNumber(),
				headBlockTime: new Date(headBlockTime.toNumber()),
				version: version.toString(),
				nativeInfo: {
					chain: chain.toString(),
					transacitonByteFee: this._api.consts.transactionPayment.transactionByteFee,
					decimals: this._api.registry.chainDecimals[0],
					SS58: this._api.registry.chainSS58,
				}
			}
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

	public async getBlock(blockNumber: PolkadotBlockNumber): Promise<PolkadotBlock> {
		try {
			const blockHash = await this._api.rpc.chain.getBlockHash(blockNumber)
			const block = await this._api.rpc.chain.getBlock(blockHash)
			return block.toHuman()
		} catch (error) {
			throw error
		}
	}

	public async fetchBalance(address: PolkadotAddress): Promise<{ balance: string}> {
		const balanceInfo = await this.getBalance(isU8a(address) ? u8aToString(address) : address)
		const balance = balanceInfo.free.sub(balanceInfo.miscFrozen)
		return { balance: balance.toString() }
	}

	public async getBalance(address: string): Promise<PolkadotAccountBalance> {
		try {
			const { data } = await this._api.query.system.account(address)

			return data
		} catch (error) {
			throw error
		}
	}

	public async estimateTxFee(sender: PolkadotKeyringPair, receiver: PolkadotAddress, amount: DotAmount): Promise<PolkadotPaymentInfo> {
		try {
			const info = await this._api.tx.balances.transfer(receiver, amount)
																							.paymentInfo(sender)

			const paymentInfo: PolkadotPaymentInfo = {
				weight: info.weight,
				partialFee: info.partialFee
			}

			return paymentInfo
		} catch (error) {
			throw error
		}
	}

	public async sendTransaction(sender: PolkadotKeyringPair, receiver: PolkadotAddress, amount: DotAmount): Promise<PolkadotHash> {
		try{
			const tx = await this._api.tx.balances.transfer(receiver, amount)
			const paymentInfo = await tx.paymentInfo(sender)
			const fee = paymentInfo.partialFee.toString()
			const balanceInfo = await this.getBalance(sender.address)
			const balance = balanceInfo.free.sub(balanceInfo.miscFrozen)

			const bnFee = new BigNumber(fee, this._chainInfo.nativeInfo.decimals)
			const bnAmount = new BigNumber(amount.toString(), this._chainInfo.nativeInfo.decimals)
			const bnBalance = new BigNumber(balance.toString(), this._chainInfo.nativeInfo.decimals)

			if (bnFee.plus(bnAmount).isGreaterThan(bnBalance) ) {
				throw new Error('Insufficient balance')
			}

			const txHash = await tx.signAndSend(sender)
			return txHash
		} catch (error) {
			throw error
		}
	}

	public assertIsConnected(): void {
		if (!this._isConnected) {
			throwNewError('Not connected to chain')
		}
	}
}