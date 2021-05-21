import { isNullOrEmpty } from '../../../../../helpers'
import { throwNewError } from '../../../../../errors'
import { EthereumAddress, EthereumPrivateKey, EthereumTransactionAction } from '../../../models'
import { EthereumMultisigPluginTransaction } from '../ethereumMultisigPlugin'
import {
  approveSafeTransactionHash,
  getEthersJsonRpcProvider,
  getGnosisSafeContract,
  getSafeExecuteRawTransaction,
  getSafeOwnersAndThreshold,
  transactionToSafeTx,
  signSafeTransactionHash,
} from './helpers'
import {
  EthereumGnosisTransactionOptions,
  EthereumMultisigRawTransaction,
  GnosisSafeSignature,
  GnosisSafeTransaction,
} from './models'
import { toEthereumAddress } from '../../../helpers'

export class GnosisSafeMultisigPluginTransaction implements EthereumMultisigPluginTransaction {
  private _options: EthereumGnosisTransactionOptions

  private _chainUrl: string

  private _owners: EthereumAddress[]

  private _threshold: number

  private _multisigAddress: EthereumAddress

  private _rawTransaction: EthereumMultisigRawTransaction

  private _safeTransaction: GnosisSafeTransaction

  private _gnosisSignatures: GnosisSafeSignature[]

  private assertValidOptions(options: EthereumGnosisTransactionOptions) {
    const { multisigAddress } = options

    if (isNullOrEmpty(multisigAddress)) {
      throwNewError('If plugin is initialized for transaction, multisigAddress field must exists')
    }
  }

  constructor(options: EthereumGnosisTransactionOptions, chainUrl: string) {
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

  get options(): EthereumGnosisTransactionOptions {
    return this._options
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

  get owners(): EthereumAddress[] {
    return this._owners
  }

  get threshold(): number {
    return this._threshold
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
    console.log('GNOSISMISSINGSIGH: ', missingSignatures)
    const signaturesAttachedCount = (this.requiredAuthorizations?.length || 0) - missingSignatures.length
    // check if number of signatures present are greater then or equal to multisig threshold
    // If threshold reached, return null for missing signatures
    return signaturesAttachedCount >= this.threshold ? null : missingSignatures
  }

  /** Signatures array of safeTransaction that will be passed in executeSafeTransaction */
  get gnosisSignatures(): GnosisSafeSignature[] {
    return this._gnosisSignatures
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
    signaturesIn.forEach(signature => {
      if (!this.owners.includes(signature.signer))
        throwNewError(`Signature data:${signature.data} does not belong to any of the multisig owner addresses`)
    })
    this._gnosisSignatures.concat(signaturesIn)
    if (isNullOrEmpty(this.missingSignatures)) {
      await this.setRawTransaction()
    }
  }

  /** Sending a transaction to chain by the owner, which approves a spesific transaction hash.
   * Then add metadata indicates that approval into signatures array.
   */
  async approveAndAddApprovalSignature(privateKeys: EthereumPrivateKey[]) {
    const signResults = this.gnosisSignatures
    privateKeys.forEach(async pk => {
      const result = await approveSafeTransactionHash(pk, this.multisigAddress, this.safeTransaction, this.chainUrl)
      signResults.push(result)
    })
    this._gnosisSignatures = signResults
  }

  public async getNonce(): Promise<number> {
    const nonce = (await this.multisigContract.nonce()).toNumber()
    return nonce
  }

  /** Whether there is an attached signature for the provided address */
  public hasSignatureForAddress(address: EthereumAddress): boolean {
    let includes = false
    this.gnosisSignatures?.forEach(signature => {
      // Ensure check is case insensitive
      if (toEthereumAddress(signature.signer) === toEthereumAddress(address)) {
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
    this._safeTransaction = await transactionToSafeTx(transactionAction, this.options)
  }

  public async sign(privateKeys: EthereumPrivateKey[]) {
    const signResults = this.gnosisSignatures || []
    await Promise.all(
      privateKeys.map(async pk => {
        const result = await signSafeTransactionHash(pk, this.multisigAddress, this.safeTransaction, this.chainUrl)
        signResults.push(result)
      }),
    )
    this._gnosisSignatures = signResults
    if (isNullOrEmpty(this.missingSignatures)) {
      await this.setRawTransaction()
    }
  }

  /** Generates ethereum chain transaction properties (to, data..) from safeTransaction body */
  private async setRawTransaction() {
    this._rawTransaction = await getSafeExecuteRawTransaction(
      this.multisigAddress,
      this.safeTransaction,
      this.chainUrl,
      this.gnosisSignatures,
    )
  }

  public validate(): Promise<void> {
    if (!this.safeTransaction) {
      throwNewError('safeTransaction is missing. Call prepareToBeSigned()')
    }
    return null
  }
}
