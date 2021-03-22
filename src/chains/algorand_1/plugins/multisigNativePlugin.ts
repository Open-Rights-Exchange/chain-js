/* eslint-disable @typescript-eslint/no-unused-vars */
import { send } from 'process'
import * as algosdk from 'algosdk'
import { throwNewError } from '../../../errors'
import { byteArrayToHexString, hexStringToByteArray, isNullOrEmpty, uint8ArraysAreEqual } from '../../../helpers'
// eslint-disable-next-line import/no-cycle
import { Transaction } from '../../..'
import {
  AlgorandAddress,
  AlgorandMultiSignatureMsigStruct,
  AlgorandMultiSignatureStruct,
  AlgorandMultiSigOptions,
  AlgorandPrivateKey,
  AlgorandPublicKey,
  AlgorandRawTransactionMultisigStruct,
  AlgorandRawTransactionStruct,
  AlgorandSignature,
  AlgorandTransactionOptions,
  AlgorandTxSignResults,
} from '../models'
import { AlgorandActionHelper } from '../algoAction'
import { getAlgorandPublicKeyFromPrivateKey } from '../algoCrypto'
import {
  assertValidSignatures,
  getPublicKeyForAddress,
  isValidTxSignatureForPublicKey,
  toAddressFromPublicKey,
  toAlgorandAddressFromRawStruct,
  toAlgorandPublicKey,
  toAlgorandSignatureFromRawSig,
  toPublicKeyFromAddress,
  toRawTransactionFromSignResults,
} from '../helpers'

interface AlgorandMultisigPluginInput {
  options?: AlgorandTransactionOptions
  raw?: AlgorandRawTransactionMultisigStruct
}

export class AlgorandMultisigPlugin implements Partial<Transaction> {
  private _rawTransactionMultisig: any

  private _actionHelper: AlgorandActionHelper

  private _options: AlgorandTransactionOptions

  constructor(input: AlgorandMultisigPluginInput) {
    const { options, raw } = input
    if (raw) {
      this.setRawTransactionFromSignResults({ txID: null, blob: algosdk.encodeObj(raw) })
    } else {
      this._options = options || {}
    }
  }

  get options() {
    return this._options
  }

  /** Multisig transaction options */
  get multiSigOptions(): AlgorandMultiSigOptions {
    return this._rawTransactionMultisig?.msig
      ? this.multisigOptionsFromRawTransactionMultisig(this._rawTransactionMultisig?.msig)
      : null
  }

  /** Get the raw transaction (either regular or multisig) */
  get rawMultisigTransaction(): AlgorandRawTransactionMultisigStruct {
    return this._rawTransactionMultisig
  }

  /** Whether the raw transaction body has been set or prepared */
  get hasRaw(): boolean {
    return !!this._rawTransactionMultisig
  }

  /** Throws if no raw transaction body */
  private assertHasRaw(): void {
    if (!this.hasRaw) {
      throwNewError('Transaction doesnt have a raw transaction body. Call prepareToBeSigned() or use setFromRaw().')
    }
  }

  /** Generate the raw transaction body using the actions attached
   *  Also adds a header to the transaction that is included when transaction is signed
   */
  public async prepareMultisigToBeSigned(rawTransaction: AlgorandRawTransactionMultisigStruct): Promise<void> {
    this._rawTransactionMultisig = {
      txn: rawTransaction,
      msig: {
        v: this.multiSigOptions.version,
        thr: this.multiSigOptions.threshold,
        subsig: this.multiSigOptions.addrs.map(addr => ({
          pk: Buffer.from(hexStringToByteArray(toPublicKeyFromAddress(addr))),
        })),
      },
    }
  }

  /** Determine standard multisig options from raw msig struct */
  private multisigOptionsFromRawTransactionMultisig(msig: AlgorandMultiSignatureMsigStruct): AlgorandMultiSigOptions {
    if (isNullOrEmpty(msig)) return null
    const addrs = msig.subsig.map(sig => toAddressFromPublicKey(toAlgorandPublicKey(byteArrayToHexString(sig.pk))))
    return {
      version: msig.v,
      threshold: msig.thr,
      addrs,
    }
  }

  /** Signatures attached to transaction */
  get signatures(): AlgorandSignature[] {
    const signatures = (this.rawMultisigTransaction as AlgorandRawTransactionMultisigStruct)?.msig?.subsig
      ?.filter(subsig => !!subsig.s)
      ?.map(subsig => toAlgorandSignatureFromRawSig(subsig.s))

    return signatures || null
  }

  /** Whether there is an attached signature for the provided publicKey */
  public hasSignatureForPublicKey(publicKey: AlgorandPublicKey): boolean {
    const pks = this.getPublicKeysForSignaturesFromRawTx() || []
    return !!pks.find(key => key === publicKey)
  }

  /** Returns address, for which, a matching signature must be attached to transaction */
  public get missingSignatures(): AlgorandAddress[] {
    const missingSignatures =
      this.requiredAuthorizations?.filter(auth => !this.hasSignatureForPublicKey(toPublicKeyFromAddress(auth))) || []
    const signaturesAttachedCount = (this.requiredAuthorizations?.length || 0) - missingSignatures.length

    // check if number of signatures present are greater then or equal to multisig threshold
    // If threshold reached, return null for missing signatures
    return signaturesAttachedCount >= this.multiSigOptions.threshold ? null : missingSignatures
  }

  /** Returns public keys of the signatures attached to the signed transaction
   *  For a typical transaction, there is only signature, multiSig transactions can have more */
  public getPublicKeysForSignaturesFromRawTx(): AlgorandPublicKey[] {
    const { msig } = this._rawTransactionMultisig
    // drop empty values in subsig
    const multiSigs = msig?.subsig?.filter((sig: AlgorandMultiSignatureStruct) => !!sig?.s) || []
    return multiSigs?.map((sig: AlgorandMultiSignatureStruct) => toAlgorandPublicKey(byteArrayToHexString(sig.pk)))
  }

  /** Add signatures to raw transaction
   *  Only allows signatures that use the publicKey(s) required for the transaction (from accnt, rekeyed spending key, or mulisig keys)
   *  Signatures are hexstring encoded Uint8Array */
  addSignatures = (signaturesIn: AlgorandSignature[]): void => {
    const signatures = signaturesIn || []
    this.assertHasRaw()
    assertValidSignatures(signatures)
    // Handle multisig transaction
    if (isNullOrEmpty(signatures) && this?._rawTransactionMultisig?.msig) {
      // wipe out all the signatures in the subsig array (just set the public key)
      this._rawTransactionMultisig.msig.subsig = this._rawTransactionMultisig.msig.subsig.map((ss: any) => ({
        pk: ss.pk,
      }))
    }
    // For every signature provided...
    signatures.forEach(sig => {
      // look for a match with any of the publicKeys in the multiSigOptions
      const addressForSig = this.multiSigOptions.addrs.find(addr =>
        isValidTxSignatureForPublicKey(sig, getPublicKeyForAddress(addr)),
      )
      if (addressForSig) {
        const newPubKey = hexStringToByteArray(getPublicKeyForAddress(addressForSig))
        const newSig = hexStringToByteArray(sig)
        // set signature for publickey in subsig array
        this._rawTransactionMultisig.msig.subsig.find((ss: any) => uint8ArraysAreEqual(ss.pk, newPubKey)).s = newSig
      } else {
        const errorMsg = `The signature: ${sig} isnt valid for this transaction using any of publicKeys specified in multiSigOptions: ${JSON.stringify(
          this.multiSigOptions,
        )}.`
        throwNewError(errorMsg)
      }
    })
  }

  /** Returns array of the required addresses for a transaction/multisig transaction
   *  Returns the from address in the action or addresses from multisig options for multisig transaction
   */
  public get requiredAuthorizations(): AlgorandAddress[] {
    return this?.multiSigOptions?.addrs || []
  }

  /** Set the raw trasaction properties from the packed results from using Algo SDK to sign tx */
  public setRawTransactionFromSignResults(signResults: AlgorandTxSignResults) {
    const { transaction } = toRawTransactionFromSignResults(signResults)
    console.log('MULTISIGRTRX: ', transaction)
    this._rawTransactionMultisig = transaction as AlgorandRawTransactionMultisigStruct
  }

  async signMultisig(privateKeys: AlgorandPrivateKey[], transactionId: string) {
    let signedMergedTransaction: AlgorandTxSignResults
    const signedTransactionResults: AlgorandTxSignResults[] = []
    // start with existing multiSig transaction/signatures (if any)
    if (!isNullOrEmpty(this._rawTransactionMultisig)) {
      signedTransactionResults.push({
        txID: transactionId,
        blob: algosdk.encodeObj(this._rawTransactionMultisig),
      })
    }
    // add signatures for each private key provided
    privateKeys.forEach(key => {
      const privateKey = hexStringToByteArray(key)
      const action = this._actionHelper.actionEncodedForSdk
      const privateKeyAddress = toAddressFromPublicKey(getAlgorandPublicKeyFromPrivateKey(key))
      if (!this.multiSigOptions.addrs.includes(privateKeyAddress)) {
        throwNewError(
          `Cant sign multisig transaction the private key of address ${privateKeyAddress} - it doesnt match an address in multisig options: ${this.multiSigOptions.addrs}`,
        )
      }
      const signResults: AlgorandTxSignResults = algosdk.signMultisigTransaction(
        action,
        this.multiSigOptions,
        privateKey,
      )
      signedTransactionResults.push(signResults)
    })
    // if more than one sig, use the sdk's merge function
    if (signedTransactionResults.length > 1) {
      const { txID } = signedTransactionResults[0] // txID should be the same for all results
      const blob = algosdk.mergeMultisigTransactions(signedTransactionResults.map(r => r.blob))
      signedMergedTransaction = { txID, blob }
    } else {
      // eslint-disable-next-line prefer-destructuring
      signedMergedTransaction = signedTransactionResults[0]
    }
    // set results to class
    this.setRawTransactionFromSignResults(signedMergedTransaction)
  }
}

export interface AlgorandMultisig {}
