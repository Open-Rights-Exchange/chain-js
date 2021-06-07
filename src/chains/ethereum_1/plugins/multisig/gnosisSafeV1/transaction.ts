import { isNullOrEmpty, jsonParseAndRevive } from '../../../../../helpers'
import { throwNewError } from '../../../../../errors'
import { EthereumAddress, EthereumPrivateKey, EthereumTransactionAction } from '../../../models'
import { EthereumMultisigPluginTransaction } from '../ethereumMultisigPlugin'
import {
  approveSafeTransaction,
  getEthersJsonRpcProvider,
  getGnosisSafeContract,
  getSafeExecuteRawTransaction,
  getSafeOwnersAndThreshold,
  transactionToSafeTx,
  getSafeTransactionHash,
  signSafeTransactionHash,
} from './helpers'
import {
  EthereumGnosisMultisigTransactionOptions,
  EthereumMultisigRawTransaction,
  GnosisSafeSignature,
  GnosisSafeRawTransaction,
  GnosisSafeTransaction,
} from './models'
import { toEthereumAddress } from '../../../helpers'

export class GnosisSafeMultisigPluginTransaction implements EthereumMultisigPluginTransaction {
  private _options: EthereumGnosisMultisigTransactionOptions

  private _chainUrl: string

  private _owners: EthereumAddress[]

  private _threshold: number

  private _multisigAddress: EthereumAddress

  private _parentRawTransaction: EthereumMultisigRawTransaction

  private _rawTransaction: GnosisSafeRawTransaction

  private _transactionHash: string

  public requiresParentTransaction = true

  private assertValidOptions(options: EthereumGnosisMultisigTransactionOptions) {
    const { multisigAddress } = options

    if (isNullOrEmpty(multisigAddress)) {
      throwNewError('If plugin is initialized for transaction, multisigAddress field must exists')
    }
  }

  constructor(options: EthereumGnosisMultisigTransactionOptions, chainUrl: string) {
    this.assertValidOptions(options)
    this._options = options
    this._chainUrl = chainUrl
    const { multisigAddress } = options
    this._multisigAddress = multisigAddress
  }

  /** Allows parent class to (re)initialize options */
  async init() {
    const { owners, threshold } = await getSafeOwnersAndThreshold(this.multisigContract)
    this._owners = owners
    this._threshold = threshold
  }

  // ----------------------- TRANSACTION Members ----------------------------

  get options(): EthereumGnosisMultisigTransactionOptions {
    return this._options
  }

  /** Same as rawTransaction, except signatures.
   * To be used with gnosis utils, which expects this format for serializations
   */
  get safeTransaction(): GnosisSafeTransaction {
    const safeTransaction = { ...this.rawTransaction }
    delete safeTransaction.signatures
    return safeTransaction
  }

  /** Whether the raw transaction body has been set or prepared */
  get hasParentTransaction(): boolean {
    return !!this._parentRawTransaction
  }

  /** Get the raw transaction (either regular or multisig) */
  get parentRawTransaction(): EthereumMultisigRawTransaction {
    return this._parentRawTransaction
  }

  /** Whether the raw transaction body has been set or prepared */
  get hasRawTransaction(): boolean {
    return !!this._rawTransaction
  }

  get rawTransaction(): GnosisSafeRawTransaction {
    return this._rawTransaction
  }

  get multisigAddress(): EthereumAddress {
    return this._multisigAddress
  }

  get owners(): EthereumAddress[] {
    return this._owners
  }

  get threshold(): number {
    return this._threshold
  }

  /** Calculated transactionHash from safeTransaction */
  get transactionHash(): string {
    return this._transactionHash
  }

  get chainUrl(): string {
    return this._chainUrl
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
  get gnosisSignatures(): GnosisSafeSignature[] {
    const { signatures } = this.rawTransaction

    const parsedSignatures = !isNullOrEmpty(signatures) ? jsonParseAndRevive(signatures) : []
    return parsedSignatures
  }

  /** Signatures - implementation required by interface */
  get signatures(): any[] {
    throw new Error('Invalid usage - Gnosis plugin hold signatures in the TX data')
  }

  /** Returns array of the required addresses for a transaction/multisig transaction
   *  Returns the from address in the action or addresses from multisig options for multisig transaction
   */
  public get requiredAuthorizations(): EthereumAddress[] {
    return this.owners || []
  }

  /** Checks if signature addresses match with multisig owners and adds to the signatures array */
  async addSignatures(signaturesIn: GnosisSafeSignature[]) {
    if (!isNullOrEmpty(signaturesIn)) {
      // Case insensitive
      const lowercaseOwners = this.owners.map(owner => owner.toLowerCase())
      signaturesIn.forEach(signature => {
        if (!lowercaseOwners.includes(signature.signer.toLowerCase())) {
          throwNewError(`Signature data:${signature.data} does not belong to any of the multisig owner addresses`)
        }
      })
      const signatures = this.gnosisSignatures.concat(signaturesIn)
      this._rawTransaction.signatures = JSON.stringify(signatures)
    }
    await this.setParentTransactionIfReady()
  }

  /** Sending a transaction to chain by the owner, which approves a spesific transaction hash.
   * Then add metadata indicates that approval into signatures array.
   */
  async approveAndAddApprovalSignature(privateKeys: EthereumPrivateKey[]) {
    const signResults: GnosisSafeSignature[] = []
    privateKeys.forEach(async pk => {
      const result = await approveSafeTransaction(pk, this.multisigAddress, this.safeTransaction, this.chainUrl)
      signResults.push(result)
    })
    this.addSignatures(signResults)
  }

  /** Determine the Nonce to use for the transaction - automatically advances by Gnosis contract if needed */
  public async getNonce(): Promise<number> {
    const nonce = (await this.multisigContract.nonce()).toNumber()
    return nonce
  }

  /** Whether there is an attached signature for the provided address */
  public hasSignatureForAddress(address: EthereumAddress): boolean {
    let includes = false
    this.gnosisSignatures?.map(signature => {
      // Ensure check is case insensitive
      if (toEthereumAddress(signature.signer).toLowerCase() === toEthereumAddress(address).toLowerCase()) {
        includes = true
      }
    })

    return includes
  }

  /** Verify and set multisigAddress, owners and threshold.
   * Set safeTransaction from rawTransaction that has passed from ethTransaction class.
   */
  public async prepareToBeSigned(transactionAction: EthereumTransactionAction): Promise<void> {
    // adds transactionOptions into input that is provided from constructor
    this._rawTransaction = await transactionToSafeTx(transactionAction, this.options)
    await this.calculateTransactionHash()
  }

  public async calculateTransactionHash() {
    this._transactionHash = await getSafeTransactionHash(this.multisigAddress, this.safeTransaction, this.chainUrl)
  }

  public async setFromRaw(rawTransaction: GnosisSafeRawTransaction) {
    this._rawTransaction = rawTransaction
    await this.calculateTransactionHash()
    await this.setParentTransactionIfReady()
  }

  public async sign(privateKeys: EthereumPrivateKey[]) {
    const signResults: GnosisSafeSignature[] = []
    await Promise.all(
      privateKeys.map(async pk => {
        const result = await signSafeTransactionHash(pk, this.transactionHash)
        signResults.push(result)
      }),
    )
    this.addSignatures(signResults)
    await this.setParentTransactionIfReady()
  }

  /** Generates ethereum chain transaction properties (to, data..) from safeTransaction body */
  private async setParentTransactionIfReady(): Promise<void> {
    if (isNullOrEmpty(this.missingSignatures)) {
      this._parentRawTransaction = await getSafeExecuteRawTransaction(
        this.multisigAddress,
        this.safeTransaction,
        this.chainUrl,
        this.gnosisSignatures,
      )
    }
  }

  public validate(): Promise<void> {
    if (!this.rawTransaction) {
      throwNewError('safeTransaction is missing. Call prepareToBeSigned()')
    }
    return null
  }
}
