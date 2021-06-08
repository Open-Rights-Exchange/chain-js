import { ethers, Contract, ContractInterface, BigNumberish, utils, PopulatedTransaction } from 'ethers'
import GnosisSafeSol from '@gnosis.pm/safe-contracts/build/artifacts/contracts/GnosisSafe.sol/GnosisSafe.json'
import ProxyFactorySol from '@gnosis.pm/safe-contracts/build/artifacts/contracts/proxies/GnosisSafeProxyFactory.sol/GnosisSafeProxyFactory.json'
import {
  EthereumAddress,
  EthereumPrivateKey,
  EthereumRawTransactionAction,
  EthereumTransactionAction,
} from '../../../models'
import {
  InitializerAction,
  EIP712_SAFE_TX_TYPE,
  EthereumGnosisMultisigCreateAccountOptions,
  EthereumGnosisMultisigTransactionOptions,
  EthereumMultisigRawTransaction,
  GnosisSafeSignature,
  GnosisSafeTransaction,
} from './models'
import { EMPTY_DATA, SENTINEL_ADDRESS } from '../../../ethConstants'
import {
  DEFAULT_FALLBACK_HANDLER_ADDRESS,
  DEFAULT_GAS_TOKEN,
  DEFAULT_GNOSIS_SAFE_SINGLETION_ADDRESS,
  DEFAULT_PROXY_FACTORY_ADDRESS,
  DEFAULT_REFUND_RECIEVER,
  DEFAULT_TX_BASE_GAS,
  DEFAULT_TX_GAS_PRICE,
  DEFAULT_TX_SAFE_GAS,
  EMPTY_TX_OPERATION,
  EMPTY_TX_VALUE,
} from './constants'

import {
  isNullOrEmptyEthereumValue,
  generateDataFromContractAction,
  toEthereumEntityName,
  toEthereumTxData,
  toEthereumAddress,
  toEthBuffer,
} from '../../../helpers'
import { isNullOrEmpty, nullifyIfEmpty, removeEmptyValuesInJsonObject } from '../../../../../helpers'
import { throwNewError } from '../../../../../errors'

// TODO: move to a more generic directory (Consider using EthersJs)
export function getEthersJsonRpcProvider(url: string) {
  return new ethers.providers.JsonRpcProvider(url)
}
// TODO: move to a more generic directory
export function getEthersWallet(privateKey: string, provider?: ethers.providers.Provider) {
  return new ethers.Wallet(privateKey, provider)
}

/** Returns GnosisSafe (for singleton master or proxy) contract instance, that is gonna be used for
 * generating action hashes that is going to be executed by multisigAccount wether is
 * creating account, or executing transactions
 */
export function getGnosisSafeContract(provider: ethers.providers.Provider, address: EthereumAddress): Contract {
  return new Contract(address, GnosisSafeSol.abi as ContractInterface, provider)
}

/** Returns the contract instance, allows for creating new multisig accounts */
export function getProxyFactoryEthersContract(provider: ethers.providers.Provider, address: EthereumAddress): Contract {
  return new Contract(address, ProxyFactorySol.abi as ContractInterface, provider)
}

export function setupInitilaizerAction(initializerAction?: InitializerAction) {
  const { initializerTo, initializerData, paymentToken, paymentAmount, paymentReceiver } = initializerAction || {}
  return {
    initializerTo: initializerTo || SENTINEL_ADDRESS,
    initializerData: initializerData || EMPTY_DATA,
    paymentToken: paymentToken || SENTINEL_ADDRESS,
    paymentAmount: paymentAmount || 0,
    paymentReceiver: paymentReceiver || SENTINEL_ADDRESS,
  }
}

export function sortHexStrings(hexArray: string[]) {
  hexArray?.sort((left, right) => left?.toLowerCase().localeCompare(right?.toLowerCase()))
  return hexArray
}

export async function getCreateProxyInitializerData(
  multisigOptions: EthereumGnosisMultisigCreateAccountOptions,
  chainUrl: string,
) {
  const { gnosisSafeMaster, fallbackHandler, initializerAction, threshold, owners } = multisigOptions
  const ethersProvier = getEthersJsonRpcProvider(chainUrl)
  const gnosisSafeMasterContract = getGnosisSafeContract(ethersProvier, gnosisSafeMaster)
  const { initializerTo, initializerData, paymentToken, paymentAmount, paymentReceiver } = setupInitilaizerAction(
    initializerAction,
  )
  const sortedAddrs = sortHexStrings(owners)
  const { data } = await gnosisSafeMasterContract.populateTransaction.setup(
    sortedAddrs,
    threshold,
    initializerTo,
    initializerData,
    fallbackHandler,
    paymentToken,
    paymentAmount,
    paymentReceiver,
  )
  return data
}

/** Throws if any options missing that are needed for proxy */
export function assertMultisigOptionsForProxyArePresent(multisigOptions: EthereumGnosisMultisigCreateAccountOptions) {
  if (
    isNullOrEmpty(multisigOptions?.owners) ||
    isNullOrEmpty(multisigOptions?.threshold) ||
    isNullOrEmptyEthereumValue(multisigOptions?.gnosisSafeMaster) ||
    isNullOrEmptyEthereumValue(multisigOptions?.proxyFactory) ||
    isNullOrEmpty(multisigOptions?.saltNonce)
  ) {
    throwNewError(
      'Missing one or more required options: (owners, threshold, gnosisSafeMaster, or proxyFactory) for proxy contract.',
    )
  }
}

/** Simulates creating new multisigAccount deterministicly by using nonce
 *  Returns the contract address that will be assigned for multisigAccount
 */
export async function calculateProxyAddress(
  multisigOptions: EthereumGnosisMultisigCreateAccountOptions,
  chainUrl: string,
) {
  assertMultisigOptionsForProxyArePresent(multisigOptions)
  const { gnosisSafeMaster, proxyFactory, saltNonce } = multisigOptions

  const ethersProvier = getEthersJsonRpcProvider(chainUrl)
  const proxyFactoryContract = getProxyFactoryEthersContract(ethersProvier, proxyFactory)
  const initializerData = await getCreateProxyInitializerData(multisigOptions, chainUrl)
  let address
  try {
    address = await proxyFactoryContract.callStatic.createProxyWithNonce(gnosisSafeMaster, initializerData, saltNonce)
  } catch (err) {
    throwNewError('Invalid create options. Try increasing saltNonce')
  }
  return address
}

/** Returns transaction object including ({to, data, ...}) for creating multisig proxy contract
 */
export async function getCreateProxyTransaction(
  multisigOptions: EthereumGnosisMultisigCreateAccountOptions,
  chainUrl: string,
): Promise<EthereumTransactionAction> {
  assertMultisigOptionsForProxyArePresent(multisigOptions)
  const { gnosisSafeMaster, proxyFactory, saltNonce } = multisigOptions

  const ethersProvier = getEthersJsonRpcProvider(chainUrl)
  const proxyFactoryContract = getProxyFactoryEthersContract(ethersProvier, proxyFactory)
  const initializerData = await getCreateProxyInitializerData(multisigOptions, chainUrl)
  const { to, data, value } = await proxyFactoryContract.populateTransaction.createProxyWithNonce(
    gnosisSafeMaster,
    initializerData,
    saltNonce,
  )
  return { to: toEthereumAddress(to), data: toEthereumTxData(data), value: value ? value.toString() : 0 }
}

export function calculateSafeTransactionHash(
  safe: Contract,
  safeTx: GnosisSafeTransaction,
  chainId: BigNumberish,
): string {
  return utils._TypedDataEncoder.hash({ verifyingContract: safe.address, chainId }, EIP712_SAFE_TX_TYPE, safeTx)
}

export async function getSafeNonce(multisigAddress: EthereumAddress, chainUrl: string) {
  const ethersProvier = getEthersJsonRpcProvider(chainUrl)
  const multisigContract = getGnosisSafeContract(ethersProvier, multisigAddress)
  return multisigContract.nonce()
}

export async function transactionToSafeTx(
  transactionAction: EthereumTransactionAction,
  transactionOptions: EthereumGnosisMultisigTransactionOptions,
): Promise<GnosisSafeTransaction> {
  const { to, value, data, contract } = transactionAction
  const { operation, refundReceiver, safeTxGas, baseGas, gasPrice: safeGasPice, gasToken, nonce } =
    transactionOptions || {}

  let safeTxData
  if (isNullOrEmptyEthereumValue(data) && !isNullOrEmpty(contract)) {
    safeTxData = generateDataFromContractAction(contract)
  } else {
    safeTxData = data
  }

  return {
    to,
    value: value || EMPTY_TX_VALUE,
    data: safeTxData || EMPTY_DATA,
    operation: operation || EMPTY_TX_OPERATION,
    safeTxGas: safeTxGas || DEFAULT_TX_SAFE_GAS,
    baseGas: baseGas || DEFAULT_TX_BASE_GAS,
    gasPrice: safeGasPice || DEFAULT_TX_GAS_PRICE,
    gasToken: gasToken || DEFAULT_GAS_TOKEN,
    refundReceiver: refundReceiver || DEFAULT_REFUND_RECIEVER,
    nonce,
  }
}

export async function getSafeTransactionHash(
  multisigAddress: EthereumAddress,
  safeTx: GnosisSafeTransaction,
  chainUrl: string,
): Promise<string> {
  const ethersProvier = getEthersJsonRpcProvider(chainUrl)
  const multisigContract = getGnosisSafeContract(ethersProvier, multisigAddress)
  const nonce = safeTx?.nonce || (await multisigContract.nonce())
  const hash = await multisigContract.getTransactionHash(
    safeTx.to,
    safeTx.value,
    safeTx.data,
    safeTx.operation,
    safeTx.safeTxGas,
    safeTx.baseGas,
    safeTx.gasPrice,
    safeTx.gasToken,
    safeTx.refundReceiver,
    nonce,
  )
  return hash
}

export async function signSafeTransactionHash(
  privateKey: EthereumPrivateKey,
  hash: string,
): Promise<GnosisSafeSignature> {
  const signerWallet = getEthersWallet(privateKey)
  const typedDataHash = utils.arrayify(hash)
  const data = (await signerWallet.signMessage(typedDataHash)).replace(/1b$/, '1f').replace(/1c$/, '20')
  return {
    signer: toEthereumAddress(signerWallet.address),
    data,
  }
}

/** Generates GnosisSafe signature object, that is gonne be passed in as serialized for executeTransaction  */
export async function signSafeTransaction(
  privateKey: EthereumPrivateKey,
  multisigAddress: EthereumAddress,
  safeTx: GnosisSafeTransaction,
  chainUrl: string,
): Promise<GnosisSafeSignature> {
  const trxHash = await getSafeTransactionHash(multisigAddress, safeTx, chainUrl)
  return signSafeTransactionHash(privateKey, trxHash)
}

/** Sends approveHash call for gnosis and returns signature placeholder that indicates approval */
export async function approveSafeTransaction(
  privateKey: EthereumPrivateKey,
  multisigAddress: EthereumAddress,
  safeTx: GnosisSafeTransaction,
  chainUrl: string,
): Promise<GnosisSafeSignature> {
  const ethersProvier = getEthersJsonRpcProvider(chainUrl)
  const multisigContract = getGnosisSafeContract(ethersProvier, multisigAddress)
  const { chainId } = await ethersProvier.getNetwork()

  const signerWallet = getEthersWallet(privateKey)
  const trxHash = calculateSafeTransactionHash(multisigContract, safeTx, chainId)
  const typedDataHash = utils.arrayify(trxHash)

  const signerSafe = multisigContract.connect(signerWallet)
  await signerSafe.approveHash(typedDataHash)

  return {
    signer: toEthereumEntityName(signerWallet.address),
    data: `0x000000000000000000000000${signerWallet.address.slice(
      2,
    )}000000000000000000000000000000000000000000000000000000000000000001`,
  }
}

/** Sorts the signatures in right order and serializes */
export function buildSignatureBytes(signatures: GnosisSafeSignature[]): string {
  signatures?.sort((left, right) => left.signer.toLowerCase().localeCompare(right.signer.toLowerCase()))
  let signatureBytes = '0x'
  signatures?.forEach(sig => {
    signatureBytes += sig.data.slice(2)
  })
  return signatureBytes
}

export function populatedToRawEthereumTransaction(populatedTrx: PopulatedTransaction): EthereumRawTransactionAction {
  const { from, to, value, data, gasPrice, gasLimit, nonce } = populatedTrx

  const valueHex = ethers.BigNumber.isBigNumber(value) ? (value as ethers.BigNumber).toHexString() : value
  const gasPriceHex = ethers.BigNumber.isBigNumber(gasPrice) ? (gasPrice as ethers.BigNumber).toHexString() : gasPrice
  const gasLimitHex = ethers.BigNumber.isBigNumber(gasLimit) ? (gasLimit as ethers.BigNumber).toHexString() : gasLimit

  const transactionObject = {
    from: nullifyIfEmpty(toEthBuffer(from)),
    to: nullifyIfEmpty(toEthBuffer(to)),
    value: nullifyIfEmpty(toEthBuffer(valueHex)),
    data: nullifyIfEmpty(toEthBuffer(data)),
    gasPrice: nullifyIfEmpty(toEthBuffer(gasPriceHex)),
    gasLimit: nullifyIfEmpty(toEthBuffer(gasLimitHex)),
    nonce: nullifyIfEmpty(toEthBuffer(nonce)),
  }
  removeEmptyValuesInJsonObject(transactionObject)
  return transactionObject
}

export async function getSafeExecuteRawTransaction(
  multisigAddress: EthereumAddress,
  safeTx: GnosisSafeTransaction,
  chainUrl: string,
  signatures: GnosisSafeSignature[],
  overrides?: any,
): Promise<EthereumMultisigRawTransaction> {
  const ethersProvier = getEthersJsonRpcProvider(chainUrl)
  const multisigContract = getGnosisSafeContract(ethersProvier, multisigAddress)
  const signatureBytes = buildSignatureBytes(signatures)
  const populatedTrx = await multisigContract.populateTransaction.execTransaction(
    safeTx.to,
    safeTx.value,
    safeTx.data,
    safeTx.operation,
    safeTx.safeTxGas,
    safeTx.baseGas,
    safeTx.gasPrice,
    safeTx.gasToken,
    safeTx.refundReceiver,
    signatureBytes,
    overrides || {},
  )
  return populatedToRawEthereumTransaction(populatedTrx)
}

export async function executeSafeTransaction(
  safe: Contract,
  safeTx: GnosisSafeTransaction,
  signatures: GnosisSafeSignature[],
  overrides?: any,
): Promise<any> {
  const signatureBytes = buildSignatureBytes(signatures)
  return safe.execTransaction(
    safeTx.to,
    safeTx.value,
    safeTx.data,
    safeTx.operation,
    safeTx.safeTxGas,
    safeTx.baseGas,
    safeTx.gasPrice,
    safeTx.gasToken,
    safeTx.refundReceiver,
    signatureBytes,
    overrides || {},
  )
}

export async function getSafeOwnersAndThreshold(multisigContract: Contract) {
  const owners = await multisigContract.getOwners()
  const threshold = await multisigContract.getThreshold()
  return { owners, threshold }
}

export function applyDefaultAndSetCreateOptions(multisigOptions: EthereumGnosisMultisigCreateAccountOptions) {
  const detaultOptions: Partial<EthereumGnosisMultisigCreateAccountOptions> = {
    gnosisSafeMaster: DEFAULT_GNOSIS_SAFE_SINGLETION_ADDRESS,
    proxyFactory: DEFAULT_PROXY_FACTORY_ADDRESS,
    fallbackHandler: DEFAULT_FALLBACK_HANDLER_ADDRESS,
  }
  return { ...detaultOptions, ...multisigOptions }
}
