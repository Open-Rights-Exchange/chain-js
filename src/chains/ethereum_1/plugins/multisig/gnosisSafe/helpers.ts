import { ethers, Contract, ContractInterface, BigNumberish, utils, PopulatedTransaction } from 'ethers'

import GnosisSafeSol from '@gnosis.pm/safe-contracts/build/contracts/GnosisSafe.json'
import ProxyFactorySol from '@gnosis.pm/safe-contracts/build/contracts/GnosisSafeProxyFactory.json'

import { EthereumAddress, EthereumTransactionAction } from '../../../models'
import {
  EthereumGnosisSafeMultisigOptions,
  InitializerAction,
  GnosisSafeTransaction,
  EIP712_SAFE_TX_TYPE,
  GnosisSafeSignature,
  EthereumMultisigRawTransaction,
} from './models'
import { EMPTY_DATA, SENTINEL_ADDRESS, ZERO_ADDRESS } from '../../../ethConstants'
import { isNullOrEmptyEthereumValue, toEthereumTxData, generateDataFromContractAction } from '../../../helpers'
import { isNullOrEmpty, removeEmptyValuesInJsonObject } from '../../../../../helpers'
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
  hexArray?.sort((left, right) => left.toLowerCase().localeCompare(right.toLowerCase()))
  return hexArray
}

export async function getCreateProxyInitializerData(multisigOptions: EthereumGnosisSafeMultisigOptions) {
  const { pluginOptions, weight: threshold, addrs } = multisigOptions
  const { gnosisSafeMasterAddress, fallbackHandlerAddress, chainUrl, initializerAction } = pluginOptions
  const ethersProvier = getEthersJsonRpcProvider(chainUrl)
  const gnosisSafeMasterContract = getGnosisSafeContract(ethersProvier, gnosisSafeMasterAddress)
  const { initializerTo, initializerData, paymentToken, paymentAmount, paymentReceiver } = setupInitilaizerAction(
    initializerAction,
  )
  const sortedAddrs = sortHexStrings(addrs)
  console.log('sorted: ', sortedAddrs)
  const { data } = await gnosisSafeMasterContract.populateTransaction.setup(
    sortedAddrs,
    threshold,
    initializerTo,
    initializerData,
    fallbackHandlerAddress,
    paymentToken,
    paymentAmount,
    paymentReceiver,
  )
  return data
}

/** Simulates creating new multisigAccount deterministicly by using nonce
 *  Returns the contract address that will be assigned for multisigAccount
 */
export async function calculateProxyAddress(multisigOptions: EthereumGnosisSafeMultisigOptions) {
  const { pluginOptions } = multisigOptions
  const { gnosisSafeMasterAddress, proxyFactoryAddress, chainUrl, nonce } = pluginOptions
  const ethersProvier = getEthersJsonRpcProvider(chainUrl)
  const proxyFactoryContract = getProxyFactoryEthersContract(ethersProvier, proxyFactoryAddress)
  const initializerData = getCreateProxyInitializerData(multisigOptions)
  return proxyFactoryContract.callStatic.createProxyWithNonce(gnosisSafeMasterAddress, initializerData, nonce)
}

/** Returns transaction object including ({to, data, ...}) for creating multisig proxy contract
 */
export async function getCreateProxyTransaction(multisigOptions: EthereumGnosisSafeMultisigOptions) {
  const { pluginOptions } = multisigOptions
  const { gnosisSafeMasterAddress, proxyFactoryAddress, chainUrl, nonce } = pluginOptions
  const ethersProvier = getEthersJsonRpcProvider(chainUrl)
  const proxyFactoryContract = getProxyFactoryEthersContract(ethersProvier, proxyFactoryAddress)
  const initializerData = getCreateProxyInitializerData(multisigOptions)
  return proxyFactoryContract.populateTransaction.createProxyWithNonce(gnosisSafeMasterAddress, initializerData, nonce)
}

/** Calculates proxy multisig contract's address and returns transaction object
 */
export async function getCreateProxyAddressAndTransaction(multisigOptions: EthereumGnosisSafeMultisigOptions) {
  const { pluginOptions } = multisigOptions
  const { gnosisSafeMasterAddress, proxyFactoryAddress, chainUrl, nonce } = pluginOptions
  const ethersProvier = getEthersJsonRpcProvider(chainUrl)
  const proxyFactoryContract = getProxyFactoryEthersContract(ethersProvier, proxyFactoryAddress)
  const initializerData = getCreateProxyInitializerData(multisigOptions)
  const address = await proxyFactoryContract.callStatic.createProxyWithNonce(
    gnosisSafeMasterAddress,
    initializerData,
    nonce,
  )
  const { to, data, value } = await proxyFactoryContract.populateTransaction.createProxyWithNonce(
    gnosisSafeMasterAddress,
    initializerData,
    nonce,
  )
  return { address, transaction: { to, data: toEthereumTxData(data), value: value ? value.toString() : 0 } }
}

export function calculateSafeTransactionHash(
  safe: Contract,
  safeTx: GnosisSafeTransaction,
  chainId: BigNumberish,
): string {
  return utils._TypedDataEncoder.hash({ verifyingContract: safe.address, chainId }, EIP712_SAFE_TX_TYPE, safeTx)
}

export async function getSafeNonce(multisigOptions: EthereumGnosisSafeMultisigOptions) {
  const { pluginOptions } = multisigOptions
  const { multisigAddress, chainUrl } = pluginOptions
  const ethersProvier = getEthersJsonRpcProvider(chainUrl)
  const multisigContract = getGnosisSafeContract(ethersProvier, multisigAddress)
  return multisigContract.nonce()
}

export async function rawTransactionToSafeTx(
  rawTransaction: EthereumMultisigRawTransaction,
  multisigOptions: EthereumGnosisSafeMultisigOptions,
): Promise<GnosisSafeTransaction> {
  const { to, value, data, contract } = rawTransaction
  const {
    operation,
    refundReceiver,
    safeTxGas,
    baseGas,
    gasPrice: safeGasPice,
    gasToken,
    nonce,
  } = multisigOptions?.pluginOptions

  let safeTxData
  if (isNullOrEmptyEthereumValue(data) && !isNullOrEmpty(contract)) {
    safeTxData = generateDataFromContractAction(contract)
  } else {
    safeTxData = data
  }
  return {
    to,
    value: value || 0,
    data: safeTxData || '0x',
    operation: operation || 0,
    safeTxGas: safeTxGas || 0,
    baseGas: baseGas || 0,
    gasPrice: safeGasPice || 0,
    gasToken: gasToken || ZERO_ADDRESS,
    refundReceiver: refundReceiver || ZERO_ADDRESS,
    nonce,
  }
}

export async function getSafeTransactionHash(
  multisigOptions: EthereumGnosisSafeMultisigOptions,
  safeTx: GnosisSafeTransaction,
): Promise<string> {
  const { pluginOptions } = multisigOptions
  const { chainUrl, multisigAddress } = pluginOptions
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

/** Generates GnosisSafe signature object, that is gonne be passed in as serialized for executeTransaction  */
export async function signSafeTransactionHash(
  privateKey: string,
  safeTx: GnosisSafeTransaction,
  multisigOptions: EthereumGnosisSafeMultisigOptions,
) {
  const signerWallet = getEthersWallet(privateKey)
  const trxHash = await getSafeTransactionHash(multisigOptions, safeTx)
  const typedDataHash = utils.arrayify(trxHash)
  return {
    signer: signerWallet.address,
    data: (await signerWallet.signMessage(typedDataHash)).replace(/1b$/, '1f').replace(/1c$/, '20'),
  }
}

/** Sends approveHash call for gnosis and returns signature placeholder that indicates approval */
export async function approveSafeTransactionHash(
  privateKey: string,
  safeTx: GnosisSafeTransaction,
  multisigOptions: EthereumGnosisSafeMultisigOptions,
) {
  const { pluginOptions } = multisigOptions
  const { chainUrl, multisigAddress } = pluginOptions
  const ethersProvier = getEthersJsonRpcProvider(chainUrl)
  const multisigContract = getGnosisSafeContract(ethersProvier, multisigAddress)
  const { chainId } = await ethersProvier.getNetwork()

  const signerWallet = getEthersWallet(privateKey)
  const trxHash = calculateSafeTransactionHash(multisigContract, safeTx, chainId)
  const typedDataHash = utils.arrayify(trxHash)

  const signerSafe = multisigContract.connect(signerWallet)
  await signerSafe.approveHash(typedDataHash)

  return {
    signer: signerWallet.address,
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

export function populatedToEthereumTransaction(populatedTrx: PopulatedTransaction): EthereumTransactionAction {
  const { from, to, value, data, gasPrice, gasLimit, nonce } = populatedTrx
  const transactionObject = {
    from,
    to,
    value: ethers.BigNumber.isBigNumber(value) ? (value as ethers.BigNumber).toHexString() : value,
    data: toEthereumTxData(data),
    gasPrice: ethers.BigNumber.isBigNumber(gasPrice) ? (gasPrice as ethers.BigNumber).toHexString() : gasPrice,
    gasLimit: ethers.BigNumber.isBigNumber(gasLimit) ? (gasLimit as ethers.BigNumber).toHexString() : gasLimit,
    nonce: nonce ? nonce.toString() : undefined,
  }
  removeEmptyValuesInJsonObject(transactionObject)
  return transactionObject
}

export async function getSafeExecuteTransaction(
  multisigOptions: EthereumGnosisSafeMultisigOptions,
  safeTx: GnosisSafeTransaction,
  signatures: GnosisSafeSignature[],
  overrides?: any,
): Promise<EthereumTransactionAction> {
  const { pluginOptions } = multisigOptions
  const { chainUrl, multisigAddress } = pluginOptions
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
  return populatedToEthereumTransaction(populatedTrx)
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
