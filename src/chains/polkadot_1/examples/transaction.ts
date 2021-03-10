/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { ChainFactory, ChainType } from '../../../index'
import { PolkadotChainEndpoint, PolkadotChainSettings } from '../models'

require('dotenv').config()

const { env } = process
;(async () => {
  try {
    // const westendEndpoints: PolkadotChainEndpoint[] = [
    //   {
    //     url: 'wss://westend-rpc.polkadot.io',
    //   },
    // ]

    // const westendChainOptions: PolkadotChainSettings = {}

    // const ropsten = new ChainFactory().create(ChainType.PolkadotV1, westendEndpoints, westendChainOptions)
    // await ropsten.connect()

    // const ropstenEndpoints: EthereumChainEndpoint[] = [
    //   {
    //     url: 'https://ropsten.infura.io/v3/fc379c787fde4363b91a61a345e3620a',
    //     // Web3 HttpProvider options - https://github.com/ethereum/web3.js/tree/1.x/packages/web3-providers-http#usage
    //     // options: {
    //     //   timeout: 20000,
    //     //   headers: [{ header_name: 'header-value' }],
    //     // },
    //   },
    // ]

    // const ropstenChainOptions: EthereumChainSettings = {
    //   chainForkType: {
    //     chainName: 'ropsten',
    //     hardFork: 'istanbul',
    //   },
    //   defaultTransactionSettings: {
    //     maxFeeIncreasePercentage: 20,
    //     executionPriority: TxExecutionPriority.Fast,
    //   },
    // }

    // EthereumRawTransaction type input for setFromRaw()
    // Defaults all optional properties, so you can set from raw just with to & value OR data
    const sampleSetFromRawTrx = {
      to: '5CrMhng7eMrJqSQrnw4s7By1hspxxKiAjGifTmLtieAzc3U3',
      value: '0x01',
      data: '0x00',
    }

    // const composeValueTransferParams: ValueTransferParams = {
    //   toAccountName: toChainEntityName('0x27105356F6C1ede0e92020e6225E46DC1F496b81'),
    //   amount: '0.000000000000000001',
    //   symbol: toEthereumSymbol(EthUnit.Ether),
    // }

    // const composeEthTransferParams: EthTransferParams = {
    //   to: toChainEntityName('0x27105356F6C1ede0e92020e6225E46DC1F496b81'),
    //   value: '0.000000000000000001',
    // }

    // const composeTokenTransferParams: TokenTransferParams = {
    //   contractName: toChainEntityName('0x04825941Ad80A6a869e85606b29c9D25144E91e6'),
    //   toAccountName: toChainEntityName('0x27105356F6C1ede0e92020e6225E46DC1F496b81'),
    //   symbol: toEthereumSymbol(EthUnit.Wei),
    //   // precision: 18, // precision should be provided if possible
    //   amount: '20.000000000000000000', // if precision isn't specified, token precision is infered from the number of digits after the decimal place
    // }

    // const composeERC20TransferParams: Erc20TransferParams = {
    //   contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
    //   from: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
    //   to: '0xF0109fC8DF283027b6285cc889F5aA624EaC1F55',
    //   precision: 18, // precision should be provided if possible
    //   value: '20',
    // }

    // const composeERC20IssueParams: Erc20IssueParams = {
    //   contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
    //   precision: 18, // precision should be provided if possible
    //   value: '20',
    // }

    // const composeERC721TransferFromParams: Erc721TransferFromParams = {
    //   contractAddress: '0x27105356f6c1ede0e92020e6225e46dc1f496b81',
    //   transferFrom: '0x27105356F6C1ede0e92020e6225E46DC1F496b81',
    //   to: '0xF0109fC8DF283027b6285cc889F5aA624EaC1F55',
    //   tokenId: 1,
    // }

    // const defaultEthTxOptions: EthereumTransactionOptions = {
    //   chain: 'ropsten',
    //   hardfork: 'istanbul',
    // }

    // // ---> Sign and send ethereum transfer with compose Action - using generic (cross-chain) native chain transfer action
    // const transaction = ropsten.new.Transaction(defaultEthTxOptions)
    // transaction.actions = [await ropsten.composeAction(ChainActionType.ValueTransfer, composeValueTransferParams)]
    // console.log('transaction.actions[0]:', JSON.stringify(transaction.actions[0]))
    // const decomposed = await ropsten.decomposeAction(transaction.actions[0])
    // console.log(JSON.stringify(decomposed))
    // const fee = await transaction.getSuggestedFee(TxExecutionPriority.Fast)
    // await transaction.setDesiredFee(fee)
    // await transaction.prepareToBeSigned()
    // await transaction.validate()
    // await transaction.sign([toEthereumPrivateKey(env.ROPSTEN_erc20acc_PRIVATE_KEY)])
    // console.log('raw transaction: ', transaction.raw)
    // console.log('missing signatures: ', transaction.missingSignatures)
    // console.log('transaction ID: ', transaction.transactionId)
    // console.log('send response:', JSON.stringify(await transaction.send(ConfirmType.None)))
    // console.log('send response:', JSON.stringify(await transaction.send(ConfirmType.After001))) // wait for transaction to complete on-chain before returning
    // console.log(`actual cost of tx in ETH - available once tx is processed: ${await transaction.getActualCost()}`) // getActualCost will throw if called before tx is commited to chain

    // ---> Sign and send default transfer Transaction - using generic (cross-chain) token transfer action
    // const transaction = ropsten.new.Transaction(defaultEthTxOptions)
    // transaction.actions = [await ropsten.composeAction(ChainActionType.TokenTransfer, composeTokenTransferParams)]
    // console.log(transaction.actions[0])
    // const decomposed = await ropsten.decomposeAction(transaction.actions[0])
    // console.log(decomposed)
    // console.log(
    //   'token value converted back using precision:',
    //   fromTokenValueString(decomposed[0]?.args?.amount, 10, composeTokenTransferParams?.precision),
    // )
    // await transaction.prepareToBeSigned()
    // await transaction.validate()
    // await transaction.sign([toEthereumPrivateKey(env.ROPSTEN_erc20acc_PRIVATE_KEY)])
    // console.log('missing signatures: ', transaction.missingSignatures)
    // console.log('send response:', JSON.stringify(await transaction.send()))

    // ---> Sign and send erc20 transfer Transaction
    // const transaction = ropsten.new.Transaction(ropstenChainOptions)
    // transaction.actions = [ await ropsten.composeAction(EthereumChainActionType.ERC20Transfer, composeERC20TransferParams) ]
    // console.log(transaction.actions[0])
    // const decomposed = await ropsten.decomposeAction(transaction.actions[0])
    // console.log(decomposed)
    // console.log(
    //   'token value converted back using precision:',
    //   fromTokenValueString(decomposed[0]?.args?.amount, 10, composeERC20TransferParams?.precision),
    // )
    // // const fee = await transaction.getSuggestedFee(TxExecutionPriority.Fast)
    // // await transaction.setDesiredFee(fee)
    // await transaction.prepareToBeSigned()
    // await transaction.validate()
    // await transaction.sign([toEthereumPrivateKey(env.ROPSTEN_erc20acc_PRIVATE_KEY)])
    // console.log('missing signatures: ', transaction.missingSignatures)
    // console.log('send response:', JSON.stringify(await transaction.send()))

    // ---> Sign and send erc20 issue Transaction
    // const transaction = ropsten.new.Transaction(defaultEthTxOptions)
    // transaction.actions = [await ropsten.composeAction(EthereumChainActionType.ERC20Issue, composeERC20IssueParams)]
    // console.log(transaction.actions[0])
    // const decomposed = await ropsten.decomposeAction(transaction.actions[0])
    // console.log(decomposed)
    // await transaction.prepareToBeSigned()
    // await transaction.validate()
    // await transaction.sign([toEthereumPrivateKey(env.ROPSTEN_erc20acc_PRIVATE_KEY)])
    // console.log('missing signatures: ', transaction.missingSignatures)
    // console.log('send response:', JSON.stringify(await transaction.send()))

    // // ---> Sign and send ethereum transfer with setFromRaw()
    // const transaction = ropsten.new.Transaction(defaultEthTxOptions)
    // await transaction.setFromRaw(sampleSetFromRawTrx)
    // await transaction.prepareToBeSigned()
    // const decomposed = await ropsten.decomposeAction(transaction.actions[0])
    // console.log('decomposd action:', decomposed)
    // await transaction.validate()
    // await transaction.sign([toEthereumPrivateKey(env.ROPSTEN_erc20acc_PRIVATE_KEY)])
    // console.log('raw transaction: ', JSON.stringify(transaction.raw))
    // console.log('missing signatures: ', transaction.missingSignatures)
    // console.log('send response:', JSON.stringify(await transaction.send()))

    // ---> Compose & Decompose erc721 transferFrom Transaction
    // const transaction = ropsten.new.Transaction(defaultEthTxOptions)
    // transaction.actions = [
    //   await ropsten.composeAction(EthereumChainActionType.ERC721TransferFrom, composeERC721TransferFromParams),
    // ]
    // console.log(transaction.actions[0])
    // const decomposed = await ropsten.decomposeAction(transaction.actions[0])
    // console.log(decomposed)
    // await transaction.prepareToBeSigned()
    // await transaction.validate()
  } catch (error) {
    console.log(error)
  }
  process.exit()
})()
