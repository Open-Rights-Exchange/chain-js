import Web3 from 'web3'
import { BN } from 'ethereumjs-util'
import { isNullOrEmpty } from '../../../helpers'
import { Unit, EthereumContractAction } from '../models'

export function functionSignatureToHex(functionSignature: string): string {
  const web3 = new Web3()
  return web3.eth.abi.encodeFunctionSignature(functionSignature)
}

export function abiToFunctionSignature(methodName: string, abi: any[]): string {
  let inputSignature = ''
  const method = abi.find(m => m.name === methodName)
  method.inputs.forEach((input: { type: any }) => {
    inputSignature += `${input?.type},`
  })
  inputSignature = inputSignature.slice(0, -1)
  return `${methodName}(${inputSignature})`
}

export function toWei(amount: number, type: Unit) {
  const web3 = new Web3()
  return web3.utils.toWei(new BN(amount), type)
}

export function ethereumTrxArgIsNullOrEmpty(obj: any) {
  if (isNullOrEmpty(obj) || obj === 0 || obj === '0x00' || obj === Buffer.from('0x00', 'hex')) return true
  return false
}

export function generateDataFromContractAction(contractAction: EthereumContractAction) {
  const { abi, address, method, parameters } = contractAction
  const web3 = new Web3()
  const contract = new web3.eth.Contract(abi, address)
  const methodHex = functionSignatureToHex(abiToFunctionSignature(method, abi))
  return contract.methods[methodHex](...parameters).encodeABI()
}
