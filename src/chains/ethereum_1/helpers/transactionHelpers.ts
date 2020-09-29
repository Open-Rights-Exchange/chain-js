import Web3 from 'web3'
import { BN, bufferToHex } from 'ethereumjs-util'
import { isNullOrEmpty } from '../../../helpers'
import { EthUnit, EthereumActionContract } from '../models'
import { ZERO_HEX, EMPTY_HEX, ZERO_ADDRESS } from '../ethConstants'
import { toEthereumTxData } from './cryptoModelHelpers'

/** Converts functionSignature to hexadecimal string */
export function functionSignatureToHex(functionSignature: string): string {
  const web3 = new Web3()
  return web3.eth.abi.encodeFunctionSignature(functionSignature)
}

/** Finds the method from abi json object array
 * Returns the methodName with inputSignature in a string format (myMethod(uint256,string))
 */
export function abiToFunctionSignature(methodName: string, abi: any[]): string {
  let inputSignature = ''
  if (isNullOrEmpty(methodName)) {
    throw new Error('abiToFunctionSignature - methodName missing')
  }
  const method = abi.find(m => m.name === methodName)
  if (isNullOrEmpty(method)) {
    throw new Error(`abiToFunctionSignature - method:${methodName} not found in abi`)
  }
  method.inputs.forEach((input: { type: any }) => {
    inputSignature += `${input?.type},`
  })
  inputSignature = inputSignature.slice(0, -1)
  return `${methodName}(${inputSignature})`
}

/** Checks if nullOrEmpty and ethereum spesific hexadecimal and Buffer values that implies empty */
export function isNullOrEmptyEthereumValue(obj: any) {
  if (
    isNullOrEmpty(obj) ||
    obj === 0 ||
    obj === ZERO_HEX ||
    obj === EMPTY_HEX ||
    obj === ZERO_ADDRESS ||
    obj === Buffer.from(ZERO_HEX, 'hex') ||
    obj === 'NaN'
  )
    return true
  if (Buffer.isBuffer(obj) && bufferToHex(obj) === EMPTY_HEX) return true

  return false
}

/** Uses web3-utils toWei conversion */
export function toWeiBN(amount: BN | number, fromType: EthUnit): BN {
  const web3 = new Web3()
  return web3.utils.toWei(new BN(amount), fromType)
}

/** convert a decimal string from fromType to Wei units
 *  Returns a string */
export function toWeiString(amount: string, fromType: EthUnit): string {
  if (isNullOrEmptyEthereumValue(amount)) return '0'
  const web3 = new Web3()
  return web3.utils.toWei(amount, fromType) // returns string since amount is a string
}

export function fromWeiString(wei: string, toType: EthUnit): string {
  if (isNullOrEmptyEthereumValue(wei)) return '0'
  const web3 = new Web3()
  return web3.utils.fromWei(wei, toType) // returns string since amount is a string
}

/** Converts a (string) value from one ETH unit to another - returns a string */
export function convertEthUnit(amount: string, fromType: EthUnit, toType: EthUnit): string {
  if (isNullOrEmptyEthereumValue(amount)) return '0'
  const wei = toWeiString(amount, fromType)
  const eth = fromWeiString(wei, toType)
  return eth
}

/** Converts wei amount to Gwei
 *  1 Gwei = 1000000000 wei */
export function toGweiFromWei(amount: number | BN) {
  return 0.000000001 * (amount as number)
}

/** Generates hexadecimal string for transaction data from EthereumActionContract */
export function generateDataFromContractAction(contractAction: EthereumActionContract) {
  const { abi, method, parameters } = contractAction
  const web3 = new Web3()
  const contract = new web3.eth.Contract(abi)
  const methodHex = functionSignatureToHex(abiToFunctionSignature(method, abi))
  return toEthereumTxData(contract.methods[methodHex](...parameters).encodeABI())
}

/** if value is null or a empty Eth value (e.g. '0x00..') returns null, otherwise return the value passed-in */
export function nullifyIfEmptyEthereumValue(value: any) {
  if (isNullOrEmptyEthereumValue(value)) return null
  return value
}
