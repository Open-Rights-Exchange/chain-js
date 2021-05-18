/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
// import CPK, { Web3Adapter } from 'contract-proxy-kit'
// import { AbiItem } from 'web3-utils'
// import GnosisSafeSol from '@gnosis.pm/safe-contracts/build/contracts/GnosisSafe.json'
// import ProxyFactorySol from '@gnosis.pm/safe-contracts/build/contracts/GnosisSafeProxyFactory.json'
// import Web3 from 'web3'
// import { GnosisSafe } from 'GnosisSafe'
// import { GnosisSafeProxyFactory } from 'GnosisSafeProxyFactory'
// import { ChainEthereumV1, ChainFactory, ChainType } from '../../../index'
// import { ConfirmType, TxExecutionPriority } from '../../../models'

// import { EthereumChainEndpoint, EthereumChainSettings } from '../models'
// import { toEthereumPrivateKey, toEthereumTxData } from '../helpers'

// const thisWeb3 = new Web3('https://goerli.infura.io/v3/fc379c787fde4363b91a61a345e3620a')

// export const getGnosisSafeContract = (web3: Web3) => {
//   const { networks } = GnosisSafeSol
//   const contractAddress = networks[5]?.address ?? networks[1].address
//   return (new web3.eth.Contract(GnosisSafeSol.abi as AbiItem[], contractAddress) as unknown) as GnosisSafe
// }

// const getProxyFactoryContract = (web3: Web3): GnosisSafeProxyFactory => {
//   const { networks } = ProxyFactorySol
//   // TODO: this may not be the most scalable approach,
//   //  but up until v1.2.0 the address is the same for all the networks.
//   //  So, if we can't find the network in the Contract artifact, we fallback to MAINNET.
//   const contractAddress = networks[5]?.address ?? networks[1].address
//   return (new web3.eth.Contract(ProxyFactorySol.abi as AbiItem[], contractAddress) as unknown) as GnosisSafeProxyFactory
// }

// export const EMPTY_DATA = '0x'
// export const SENTINEL_ADDRESS = '0x0000000000000000000000000000000000000001'
// export const MULTI_SEND_ADDRESS = '0xDA54dBc4E0dC927132672070f2b725F22c359358'
// export const SAFE_MASTER_COPY_ADDRESS = '0xF931b495653708b77c7C1bC67D73F367994978D5'
// export const DEFAULT_FALLBACK_HANDLER_ADDRESS = '0x7Be1e66Ce7Eab24BEa42521cc6bBCf60a30Fa15E'
// export const PROXY_FACTORY = '0xa584fCc2b1F3F03f094De9534Cd0A6bADbA348f6'
// const networkId = 5
// ;(async () => {
//   try {
//     const ropstenEndpoints: EthereumChainEndpoint[] = [
//       {
//         url: 'https://goerli.infura.io/v3/fc379c787fde4363b91a61a345e3620a',
//       },
//     ]
//     const ropstenChainOptions: EthereumChainSettings = {
//       chainForkType: {
//         chainName: 'goerli',
//         hardFork: 'istanbul',
//       },
//       defaultTransactionSettings: {
//         maxFeeIncreasePercentage: 20,
//         executionPriority: TxExecutionPriority.Fast,
//       },
//     }
//     const ropsten = new ChainFactory().create(
//       ChainType.EthereumV1,
//       ropstenEndpoints,
//       ropstenChainOptions,
//     ) as ChainEthereumV1
//     await ropsten.connect()

//     const safeAccounts = ['0xA200c9fe7F747E10dBccA5f85A0A126c9bffe400', '0xfE331024D0D8b1C41B6d6203426f4B717E5C8aF3']

//     const gnosisSafe = getGnosisSafeContract(thisWeb3)
//     const proxyFactoryMaster = getProxyFactoryContract(thisWeb3)
//     const gnosisSafeData = gnosisSafe.methods // hex string format
//       .setup(
//         safeAccounts, // _owners
//         2, // threshold
//         SENTINEL_ADDRESS,
//         EMPTY_DATA,
//         DEFAULT_FALLBACK_HANDLER_ADDRESS,
//         SENTINEL_ADDRESS,
//         0,
//         SENTINEL_ADDRESS,
//       )
//       .encodeABI()

//     console.log('gnosisSafe Data: ', gnosisSafeData)
//     console.log('safemaster address: ', gnosisSafe.options.address)

//     const deploymentTrxData = proxyFactoryMaster.methods
//       .createProxy(gnosisSafe.options.address, gnosisSafeData)
//       .encodeABI() // hex string format
//     console.log(deploymentTrxData)

//     const sampleSetFromRawTrx = {
//       to: '0xa584fCc2b1F3F03f094De9534Cd0A6bADbA348f6',
//       from: '0xfE331024D0D8b1C41B6d6203426f4B717E5C8aF3',
//       data: toEthereumTxData(deploymentTrxData),
//     }
//     const defaultEthTxOptions = {
//       chain: 'goerli',
//       hardfork: 'istanbul',
//     }
//     const transaction = ropsten.new.Transaction(defaultEthTxOptions)
//     await transaction.setFromRaw(sampleSetFromRawTrx)
//     await transaction.prepareToBeSigned()
//     await transaction.validate()
//     await transaction.sign([toEthereumPrivateKey('0x62fc29e5c6d3abd1beb363b3ec9d5a23a799f26ecf1b5222e5dfa609518cd173')])
//     console.log('Trx result: ', await transaction.send(ConfirmType.After001))
//   } catch (error) {
//     console.log(error)
//   }
//   process.exit()
// })()

// enum MultisigPlugins {
//   GNOSIS = 'gnosis',
// }

// type MultisigMetadata = {
//   plugin: MultisigPlugins
//   accounts: string[]
//   threshold: number
//   version: number
// }
