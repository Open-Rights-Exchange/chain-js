[![CircleCI](https://circleci.com/gh/TeamAikon/chain-js.svg?style=svg)](https://circleci.com/gh/TeamAikon/chain-js)

<img src="./docs/images/chainjs_logo.png" width="200" >

# Overview

ChainJS is a low-level Javascript helper library that helps you write code that can work with multiple blockchains. ChainJs uses a plug-in model and a unified interface to do common blockchain functions like constructing, signing, and sending blockchain transactions.

Chains plug-ins included: **Algorand**, **EOS**, **Ethereum (V1)** - more coming soon

### Example code for sending a token

```javascript
  // get a chain object (for an Ethereum chain using Ropsten testnet)
  const ethChain = new ChainFactory().create(ChainType.EthereumV1, ropstenEndpoints)
  // create a transaction object
  const sendTokenTx = await chain.new.Transaction()
  // set contract action(s) - composeAction simplifies transaction composition
  sendTokenTx.actions = [ await chain.composeAction(ChainActionType.TokenTransfer, { to: '0x271...', contractAddress: '0x048...', amount: '10.00' }) ]
  ...
  // sign and send the transaction to the chain
  await sendTokenTx.sign([privateKey])
  await sendTokenTx.send(ConfirmType.None)
```

### Example code for creating an account on-chain

```javascript
  // get a chain object (for an EOS chain using Kylin testnet)
  const eosChain = new ChainFactory().create(ChainType.ChainEosV2, kylinEndpoints, chainSettings)

  // new account options
  const accountOptions = {
    accountName: 'abcdefghijkl'
    creatorAccountName: 'mypayeraccnt',
    creatorPermission: 'active',
    ...
  }

  // get an account creator class
  const accntCreator = await eosChain.new.CreateAccount()
  // generate the transaction to create an on-chain account
  await accntCreator.composeTransaction(AccountType.Native, accountOptions)
  // sign and send the transaction to the chain
  await accntCreator.transaction.sign([{myPrivateKeys}])
  accntCreator.transaction.send()

```

### Same code - mulitple chains

By using a standardized symantic for common chain activites, you can write code once that works for many chains. The plug-in maps contract actions, transaction composition, and error types to use a unified set. With ChainJs you can build apps to support mulitple chains much more quickly.

### Native chain libraries included 

Although you can do most common tasks using the unified ChainJs api, you can still use the native chain library when necessary. For example, to access the eosjs library for an EOS chain, just cast the generic chain object to an EOS-specific chain object. Then you can access the eosjs api. Same goes for other chains. For example, for Ethereum, you can access web3 directly from the chain object. 

```javascript
   /** Using chain-specifc features - ex. eosjs */
   const myChain = new ChainFactory().create(ChainType.ChainEosV2, kylinEndpoints, chainSettings)
   // (Typescript) cast generic chain to EOS chain object
   const eosChain = (mychain as ChainEosV2) // EOSIO node version 2.x
   eosChain.eosjs.api.transact({...})
```
```javascript
   /** Using Ethereum chain-specifc features - ex. web3 */
   ...
   ethChain.web3.api.getBalance(address)
```

More chain plug-ins will be coming soon. You can also build a plug-in to support your chain of choice. Feel free to open a PR to merge in your plug-in or to create an issue for a feature request or bug.

### How to use 

Just install the chainjs library to get started
```bash
 $ yarn add @open-rights-exchange/chainjs
```

To run ts files (and examples), use ts-node (with the --files option to include local customTypes)
```bash
 $ ts-node --files mycode.ts
```
