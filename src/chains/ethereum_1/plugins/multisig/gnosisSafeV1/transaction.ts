import { getUniqueValues, isNullOrEmpty, jsonParseAndRevive } from '../../../../../helpers'
import { throwNewError } from '../../../../../errors'
import { EthereumAddress, EthereumPrivateKey, EthereumTransactionAction } from '../../../models'
import { EthereumMultisigPluginTransaction } from '../ethereumMultisigPlugin'
import {
  approveSafeTransaction,
  assertValidGnosisSignature,
  getEthersJsonRpcProvider,
  getGnosisSafeContract,
  getSafeExecuteRawTransaction,
  getSafeOwnersAndThreshold,
  getSafeTransactionHash,
  signSafeTransactionHash,
  toGnosisSignature,
  transactionToSafeTx,
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
    if (!this.hasRawTransaction) return null
    const { signatures } = this.rawTransaction
    const parsedSignatures = !isNullOrEmpty(signatures) ? jsonParseAndRevive(signatures) : []
    return parsedSignatures
  }

  /** Signatures - implementation required by interface */
  get signatures(): GnosisSafeSignature[] {
    return (this.gnosisSignatures || []).map(gs => toGnosisSignature(gs))
  }

  /** Returns array of the required addresses for a transaction/multisig transaction
   *  Returns the from address in the action or addresses from multisig options for multisig transaction
   */
  public get requiredAuthorizations(): EthereumAddress[] {
    return this.owners || []
  }

  private assertSignatureOwnerValidAndUnique(signatures: GnosisSafeSignature[]) {
    const signaturesArray = this.gnosisSignatures || []
    const lowercaseOwners = this.owners.map(owner => owner.toLowerCase()) // Case insensitive
    signatures.forEach(sigOrString => {
      const signature = toGnosisSignature(sigOrString)
      assertValidGnosisSignature(signature)
      if (!lowercaseOwners.includes(signature.signer.toLowerCase())) {
        throwNewError(`Signature data:${signature.data} does not belong to any of the multisig owner addresses`)
      }
      signaturesArray.push(signature)
    })
    const uniqueSignatures = getUniqueValues<GnosisSafeSignature>(Array.from(signaturesArray))
    return JSON.stringify(uniqueSignatures)
  }

  /** Checks if signature addresses match with multisig owners and adds to the signatures array */
  async addSignatures(signatures: GnosisSafeSignature[]) {
    this.assertHasRaw()
    if (isNullOrEmpty(signatures)) {
      await this.setParentTransactionIfReady()
      return
    }
    this._rawTransaction.signatures = this.assertSignatureOwnerValidAndUnique(signatures)
    await this.setParentTransactionIfReady()
  }

  /** Alternative (optional) way of adding a 'signature' to the Gnosis contract/transaction
   * May be called for one or more privateKeys and adds signatures to contract on-chain
   * Add a 'placeholder' signature into signatures array (placeholder is returned from approveSafeTransaction)
   * The placeholder signature(s) is needed to be sent when executing the gnosis TX on-chain
   */
  public async addApprovalSignatureToGnosisContract(privateKeys: EthereumPrivateKey[]) {
    const signResults: GnosisSafeSignature[] = []
    privateKeys.forEach(async pk => {
      const result = await approveSafeTransaction(pk, this.multisigAddress, this.safeTransaction, this.chainUrl)
      signResults.push(toGnosisSignature(result))
    })
    await this.addSignatures(signResults)
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
  public async prepareToBeSigned(action: EthereumTransactionAction): Promise<void> {
    const rawTransaction = await transactionToSafeTx(action, this.options)
    // if new rawTransaction is exactly same with previos rawTransaction except signatures, don't purge previous rawTransaction
    if (JSON.stringify(this.safeTransaction) === JSON.stringify(rawTransaction)) {
      return
    }
    this._rawTransaction = rawTransaction
    await this.calculateTransactionHash()
  }

  public async calculateTransactionHash() {
    this._transactionHash = await getSafeTransactionHash(this.multisigAddress, this.safeTransaction, this.chainUrl)
  }

  public async setFromRaw(rawTransaction: GnosisSafeRawTransaction) {
    this._rawTransaction = rawTransaction
    this.assertSignatureOwnerValidAndUnique(this.signatures)
    await this.calculateTransactionHash()
    await this.setParentTransactionIfReady()
  }

  public async sign(privateKeys: EthereumPrivateKey[]) {
    this.assertHasRaw()
    const signResults: GnosisSafeSignature[] = []
    await Promise.all(
      privateKeys.map(async pk => {
        const result = await signSafeTransactionHash(pk, this.transactionHash)
        signResults.push(toGnosisSignature(result))
      }),
    )
    await this.addSignatures(signResults)
  }

  /** Generates ethereum chain transaction properties (to, data..) from safeTransaction body */
  private async setParentTransactionIfReady(): Promise<void> {
    if (!isNullOrEmpty(this.missingSignatures)) return
    this._parentRawTransaction = await getSafeExecuteRawTransaction(
      this.multisigAddress,
      this.safeTransaction,
      this.chainUrl,
      this.gnosisSignatures,
    )
  }

  public validate(): Promise<void> {
    if (!this.rawTransaction) {
      throwNewError('safeTransaction is missing. Call prepareToBeSigned()')
    }
    return null
  }

  /** Throws if no raw transaction body */
  private assertHasRaw(): void {
    if (!this.hasRawTransaction) {
      throwNewError(
        'Gnosis Multisig transaction doesnt have a raw transaction. Use setFromRaw() or prepareToBeSigned().',
      )
    }
  }
}
