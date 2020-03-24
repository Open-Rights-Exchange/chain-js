import Web3 from 'web3'
import { BN, bufferToHex } from 'ethereumjs-util'
import { isNullOrEmpty } from '../../../helpers'
import { EthUnit, EthereumActionContract } from '../models'
import { ZERO_HEX, EMPTY_HEX } from '../../../constants'
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
  const method = abi.find(m => m.name === methodName)
  method.inputs.forEach((input: { type: any }) => {
    inputSignature += `${input?.type},`
  })
  inputSignature = inputSignature.slice(0, -1)
  return `${methodName}(${inputSignature})`
}

/** Uses web3-utils toWei conversion */
export function toWei(amount: number, type: EthUnit) {
  const web3 = new Web3()
  return web3.utils.toWei(new BN(amount), type)
}

/** Checks if nullOrEmpty and ethereum spesific hexadecimal and Buffer values that implies empty */
export function ethereumTrxArgIsNullOrEmpty(obj: any) {
  if (
    isNullOrEmpty(obj) ||
    obj === (0 || ZERO_HEX || EMPTY_HEX || Buffer.from(ZERO_HEX, 'hex')) ||
    bufferToHex(obj) === EMPTY_HEX
  )
    return true

  return false
}

/** Generates hexadecimal string for transaction data from EthereumActionContract */
export function generateDataFromContractAction(contractAction: EthereumActionContract) {
  const { abi, address, method, parameters } = contractAction
  const web3 = new Web3()
  const contract = new web3.eth.Contract(abi, address)
  const methodHex = functionSignatureToHex(abiToFunctionSignature(method, abi))
  return toEthereumTxData(contract.methods[methodHex](...parameters).encodeABI())
}
