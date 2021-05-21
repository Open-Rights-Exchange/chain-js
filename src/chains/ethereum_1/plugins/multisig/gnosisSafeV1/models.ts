import BN from 'bn.js'
import { ethers } from 'ethers'
import { EthereumAddress, EthereumTransactionAction, EthereumTxData } from '../../../models'

export type EthereumMultisigRawTransaction = EthereumTransactionAction

export type EthereumGnosisCreateAccountOptions = {
  owners: EthereumAddress[]
  threshold: number
  nonce: number
  gnosisSafeMaster?: EthereumAddress
  proxyFactory?: EthereumAddress
  fallbackHandler?: EthereumAddress
  initializerAction?: InitializerAction
}

export type EthereumGnosisTransactionOptions = {
  multisigAddress: EthereumAddress
  operation?: number
  refundReceiver?: EthereumAddress
  safeTxGas?: number | string
  baseGas?: number | string
  gasPrice?: number | string
  gasToken?: EthereumAddress
  nonce?: number
}

/** Ethereum action will be called automatically as proxy multisig contract is created
 * Can be used for a similiar functionality as createWithFirstSign
 */
export type InitializerAction = {
  initializerTo?: EthereumAddress
  initializerData?: EthereumTxData
  paymentToken?: EthereumAddress
  paymentAmount?: number
  paymentReceiver?: EthereumAddress
}

export interface GnosisSafeTransaction {
  to: string
  value: string | number | BN | ethers.BigNumber
  data: string
  operation: number
  safeTxGas: string | number
  baseGas: string | number
  gasPrice: string | number
  gasToken: string
  refundReceiver: string
  nonce: string | number
}

export const EIP712_SAFE_TX_TYPE = {
  // "SafeTx(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 nonce)"
  SafeTx: [
    { type: 'address', name: 'to' },
    { type: 'uint256', name: 'value' },
    { type: 'bytes', name: 'data' },
    { type: 'uint8', name: 'operation' },
    { type: 'uint256', name: 'safeTxGas' },
    { type: 'uint256', name: 'baseGas' },
    { type: 'uint256', name: 'gasPrice' },
    { type: 'address', name: 'gasToken' },
    { type: 'address', name: 'refundReceiver' },
    { type: 'uint256', name: 'nonce' },
  ],
}

/** Signature object that are gonna be serialized passed for executing sign trx */
export interface GnosisSafeSignature {
  signer: EthereumAddress
  data: string
}
