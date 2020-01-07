[![CircleCI](https://circleci.com/gh/Open-Rights-Exchange/ore-js/tree/master.svg?style=svg&circle-token=70a414d0e86f8d125d1a16eca8ddc379aef6fd1c)](https://circleci.com/gh/Open-Rights-Exchange/ore-js/tree/master)
# Overview

ChainJS is a low-level Javascript helper library that helps you write code that can work with multiple blockchains. ChainJs uses a plug-in model and a unified interface to do common blockchain functions like constructing, signing, and sending blockchain transactions.

### Example code for creating an account on-chain

```javascript
  // get a chain object (for an EOS chain using Kylin testnet)
  const eosChain = new ChainFactory().create(ChainType.EosChainV1_8, kylinEndpoints, chainSettings)

  // new account options
  const accounOptions = {
    payerAccountName: 'mypayeraccnt',
    payerAccountPermissionName: 'active'
  }

  // get an account creator class
  const accntCreator = eosChain.newCreateAccount()
  // generate the transaction to create an on-chain account
  await accntCreator.composeTransaction(AccountType.Native,..., accounOptions)
  // sign and send the transaction to the chain
  accntCreator.transaction.sign([{myPrivateKeys}])
  accntCreator.transaction.send()

```

### Same code - mulitple chains

By using a simplified symantic for common chain activites, you can write code once that works for many chains. The plug-in maps actitives, transaction composition, and error types to use a unified set. With ChainJs you can build apps to support mulitple chains much more quickly.

### Native chain libraries included 

Although you can do most common tasks using the unified ChainJs api, you can still use the native chain library when necessary. For example, to access the EOSJS library for an EOS chain, just cast the generic chain object to an EOS-specific chain object. Then you can access the eosjs api. Same goes for other chains. For example, for Ethereum, you can access web3 directly from the chain object. 

```javascript
   /** Using chain-specifc features - ex. eosjs */
   const myChain = new ChainFactory().create(ChainType.EosChainV1_8, kylinEndpoints, chainSettings)
   // cast generic chain to EOS chain object (using Typescript)
   const eosChain = (mychain as EosChainV1_8)
   eosChain.eosjs.api.transact({...})
```

More chain plug-ins will be coming soon. You can also build a plug-in to support you chain of choice. Feel free to open a PR to merge in your plug-in or create an issue.

### How to use 

Just install the chainjs library to get started
```bash
 $ yarn add @open-rights-exchange/chainjs
```
