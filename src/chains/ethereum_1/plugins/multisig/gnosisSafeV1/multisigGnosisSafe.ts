import { isNullOrEmpty } from '../../../../../helpers'
import { throwNewError } from '../../../../../errors'
import { toEthereumEntityName } from '../../../helpers'
import { EthereumAddress, EthereumEntityName, EthereumPrivateKey, EthereumTransactionAction } from '../../../models'
import { EthereumMultisigPlugin } from '../ethereumMultisigPlugin'
import {
  applyDefaultAndSetCreateOptions,
  approveSafeTransactionHash,
  calculateProxyAddress,
  getCreateProxyTransaction,
  getEthersJsonRpcProvider,
  getGnosisSafeContract,
  getSafeExecuteTransaction,
  getSafeOwnersAndThreshold,
  rawTransactionToSafeTx,
  signSafeTransactionHash,
} from './helpers'
import {
  EthereumGnosisMultisigOptions,
  EthereumGnosisPluginOptions,
  EthereumGnosisTransactionOptions,
  EthereumMultisigRawTransaction,
  GnosisSafeSignature,
  GnosisSafeTransaction,
} from './models'
import { ChainJsPlugin, PluginType } from '../../../../../interfaces/plugin'

export class GnosisSafeMultisigPlugin extends ChainJsPlugin implements EthereumMultisigPlugin {
  private _multisigOptions: EthereumGnosisMultisigOptions

  private _multisigAddress: EthereumAddress

  private _rawTransaction: EthereumMultisigRawTransaction

  private _safeTransaction: GnosisSafeTransaction

  private _signatures: GnosisSafeSignature[]

  private _createAccountTransactionAction: EthereumTransactionAction

  private _owners: EthereumAddress[]

  private _threshold: number

  public createAccountRequiresTransaction = true

  public name = 'Gnosis V1 Multisig Plugin'

  public type = PluginType.MultiSig

  private setOptions(options: EthereumGnosisPluginOptions) {
    const { multisigAddress, multisigOptions } = options
    this._multisigOptions = applyDefaultAndSetCreateOptions(multisigOptions)
    this._multisigAddress = multisigAddress
  }

  /** Allows parent class to (re)initialize options */
  async init(options: EthereumGnosisPluginOptions) {
    super.init(options)
    this.setOptions(options)
    this._multisigAddress = await this.determineMultisigAddressFromOptions()
    // TOOD: Basar - double check whether something exists before calling this
    this._createAccountTransactionAction = await getCreateProxyTransaction(this.multisigOptions, this.chainUrl)
    await this.verifyAndSetMultisigOwners()
  }

  // ----------------------- TRANSACTION Members ----------------------------

  get multisigOptions(): EthereumGnosisMultisigOptions {
    return this._multisigOptions
  }

  /** Get the raw transaction (either regular or multisig) */
  get rawTransaction(): EthereumMultisigRawTransaction {
    return this._rawTransaction
  }

  /** Whether the raw transaction body has been set or prepared */
  get hasRaw(): boolean {
    return !!this.rawTransaction
  }

  get safeTransaction(): GnosisSafeTransaction {
    return this._safeTransaction
  }

  get multisigAddress(): EthereumAddress {
    return this._multisigAddress
  }

  get owners(): string[] {
    this._owners = this._owners || this.multisigOptions?.owners
    if (isNullOrEmpty(this._owners)) {
      throwNewError('Owners is not set. Call prepareToBeSigned()')
    }
    return this._owners
  }

  get threshold(): number {
    if (isNullOrEmpty(this._owners)) {
      throwNewError('Threshold is not set. Call prepareToBeSigned()')
    }
    return this._threshold
  }

  get options(): EthereumGnosisPluginOptions {
    // protected property from ChainJsPlugin class
    return this._options
  }

  /** Optional parameters to specify safeTransaction options
   * E.g { refundReceiver, safeTxGas, baseGas, gasPrice, gasToken... }
   */
  get transactionOptions(): EthereumGnosisTransactionOptions {
    return this.options?.safeTransactionOptions
  }

  get chainUrl(): string {
    const { endpoints } = this.chainState
    return endpoints[0]?.url
  }

  get multisigContract(): any {
    const ethersProvier = getEthersJsonRpcProvider(this.chainUrl)
    return getGnosisSafeContract(ethersProvier, this.multisigAddress)
  }

  /** Returns address, for which, a matching signature must be included in signatures */
  public get missingSignatures(): EthereumAddress[] {
    const missingSignatures =
      this.requiredAuthorizations?.filter(address => !this.hasSignatureForAddress(address)) || []

    const signaturesAttachedCount = (this.requiredAuthorizations?.length || 0) - missingSignatures.length

    // check if number of signatures present are greater then or equal to multisig threshold
    // If threshold reached, return null for missing signatures
    return signaturesAttachedCount >= this.threshold ? null : missingSignatures
  }

  /** Signatures array of safeTransaction that will be passed in executeSafeTransaction */
  get signatures(): GnosisSafeSignature[] {
    return this._signatures
  }

  /** Returns array of the required addresses for a transaction/multisig transaction
   *  Returns the from address in the action or addresses from multisig options for multisig transaction
   */
  public get requiredAuthorizations(): EthereumAddress[] {
    return this.owners || []
  }

  /** Checks if signature addresses match with multisig owners and adds to the signatures array */
  async addSignatures(signaturesIn: GnosisSafeSignature[]) {
    signaturesIn.forEach(signature => {
      if (!this.owners.includes(signature.signer))
        throwNewError(`Signature data:${signature.data} does not belong to any of the multisig owner addresses`)
    })
    this._signatures.concat(signaturesIn)
    if (isNullOrEmpty(this.missingSignatures)) {
      await this.setRawTransaction()
    }
  }

  /** Sending a transaction to chain by the owner, which approves a spesific transaction hash.
   * Then add metadata indicates that approval into signatures array.
   */
  async approveAndAddApprovalSignature(privateKeys: EthereumPrivateKey[]) {
    const signResults = this._signatures
    privateKeys.forEach(async pk => {
      const result = await approveSafeTransactionHash(pk, this.multisigAddress, this.safeTransaction, this.chainUrl)
      signResults.push(result)
    })
    this._signatures = signResults
  }

  public async getNonce(): Promise<number> {
    const nonce = (await this.multisigContract.nonce()).toNumber()
    return nonce
  }

  /** Whether there is an attached signature for the provided address */
  public hasSignatureForAddress(address: EthereumAddress): boolean {
    let includes = false
    this.signatures?.forEach(signature => {
      if (signature.signer === address) includes = true
    })
    return includes
  }

  /** Verify and set multisigAddress, owners and threshold.
   * Set safeTransaction from rawTransaction that has passed from ethTransaction class.
   */
  public async prepareToBeSigned(rawTransaction: EthereumMultisigRawTransaction): Promise<void> {
    this._safeTransaction = await rawTransactionToSafeTx(rawTransaction, this.transactionOptions)
  }

  public async sign(privateKeys: EthereumPrivateKey[]) {
    const signResults = this._signatures || []
    await Promise.all(
      privateKeys.map(async pk => {
        const result = await signSafeTransactionHash(pk, this.multisigAddress, this.safeTransaction, this.chainUrl)
        signResults.push(result)
      }),
    )
    this._signatures = signResults
    if (isNullOrEmpty(this.missingSignatures)) {
      await this.setRawTransaction()
    }
  }

  /** Generates ethereum chain transaction properties (to, data..) from safeTransaction body */
  private async setRawTransaction() {
    this._rawTransaction = await getSafeExecuteTransaction(
      this.multisigAddress,
      this.safeTransaction,
      this.chainUrl,
      this.signatures,
    )
  }

  public validate(): void {
    if (!this.safeTransaction) {
      throwNewError('safeTransaction is missing. Call prepareToBeSigned()')
    }
  }

  /** If multisigAddress is provided in options, verify that it matches address calculated using the other multisigOptions
   *  Calls the multisig contract on chain to get the calculated address */
  public async determineMultisigAddressFromOptions() {
    const { multisigOptions } = this
    let calculatedAddress = this.multisigAddress

    // if ANY multisigOptions is provided, then calculate the multisig address
    if (!isNullOrEmpty(multisigOptions?.owners)) {
      calculatedAddress = await calculateProxyAddress(this.multisigOptions, this.chainUrl)
      if (this.multisigAddress && calculatedAddress !== this.multisigAddress) {
        throwNewError('multisigAddress and multisigOptions do not match!')
      }
    } else if (!this.multisigAddress) {
      throwNewError('must provide either multisigAddress or multisigOptions (to calculate multisig address)')
    }

    return calculatedAddress
  }

  /** Get and set owners and threshold values from multisigContract, assert equal if those values are explicitly providen. */
  async verifyAndSetMultisigOwners() {
    let owners = this._owners
    if (!this.multisigAddress) {
      const { owners: contractOwners, threshold } = await getSafeOwnersAndThreshold(this.multisigContract)
      if (this.multisigOptions?.threshold && threshold !== this.multisigOptions?.threshold) {
        throwNewError(' multisigOptions.threshold does not match with threshold on contract')
      }
      this._threshold = threshold
      owners?.forEach(ownr => {
        if (!contractOwners.includes(ownr))
          throwNewError(' multisigOptions.owners does not match with owners on contract')
      })
      owners = contractOwners
    }
    this._owners = owners
  }

  // ----------------------- CREATE ACCOUNT Members ----------------------------

  get createAccountName(): EthereumEntityName {
    if (!this._multisigAddress) {
      return null
    }
    return toEthereumEntityName(this._multisigAddress)
  }

  get createAccountTransactionAction(): EthereumTransactionAction {
    if (!this._createAccountTransactionAction)
      throwNewError('Transaction needs to be set using generateKeysIfNeeded() function')
    return this._createAccountTransactionAction
  }

  /** nothing to do for this plugin */
  public async createAccountGenerateKeysIfNeeded() {
    // nothing to do
  }
}
