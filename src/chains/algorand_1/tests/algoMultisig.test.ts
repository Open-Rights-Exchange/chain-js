// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock

import { jsonParseAndRevive, toChainEntityName } from '../../../helpers'
import { ChainFactory, ChainType } from '../../..'
import { determineMultiSigAddress, toAlgorandPrivateKey } from '../helpers'
import { multisigChainSerialized } from './mockups/multisig'
import { AlgorandMultiSigOptions } from '../models'
import { ChainActionType, ValueTransferParams } from '../../../models'

require('dotenv').config({ path: `${__dirname}/./../examples/.env` })

describe('Test Algorand Multisig Transactions', () => {
  const { env } = process
  const algoApiKey = env.AGLORAND_API_KEY || 'missing api key'
  const algoTestnetEndpoints = [
    {
      url: 'https://testnet-algorand.api.purestake.io/ps2',
      options: { indexerUrl: 'https://testnet-algorand.api.purestake.io/idx2', headers: [{ 'x-api-key': algoApiKey }] },
    },
  ]
  const algoTest = new ChainFactory().create(ChainType.AlgorandV1, algoTestnetEndpoints)

  it('setFromRaw() using chain serialized', async () => {
    await algoTest.connect()
    expect(algoTest.isConnected).toBeTruthy()

    const transaction = algoTest.new.Transaction()
    await transaction.setFromRaw(jsonParseAndRevive(multisigChainSerialized))
    await transaction.prepareToBeSigned()
    await transaction.validate()
    await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_mulitsig_child_account1_PRIVATE_KEY)])
    expect(transaction.missingSignatures).toEqual([
      'N3TSCN6IFKL6MFHOQ4KTNYJWJHSSKBK3PDSVJJBKQSCLB4RCVF37BEVHFU',
      'YIMLLIQHKASYE2I34O7M4JNOQNOHDOMXK7EK3IIFMCNAU3ZMTGCI4E5DE4',
    ])
    await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_mulitsig_child_account2_PRIVATE_KEY)])
    expect(transaction.missingSignatures).toEqual(['YIMLLIQHKASYE2I34O7M4JNOQNOHDOMXK7EK3IIFMCNAU3ZMTGCI4E5DE4'])
    await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_mulitsig_child_account3_PRIVATE_KEY)])
    expect(transaction.missingSignatures).toBeNull()
  })

  it('set multisig payment action', async () => {
    const valueTransferParams: ValueTransferParams = {
      fromAccountName: toChainEntityName('CXNBI5GZJ3I5IKEUT73SHSTWRUQ3UVAYZBQ5RNLR5CM2LFFL7W7W5433DM'),
      toAccountName: toChainEntityName('VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ'),
      amount: '1',
    }
    const multiSigOptions: AlgorandMultiSigOptions = {
      version: 1,
      threshold: 3,
      addrs: [
        env.ALGOTESTNET_mulitsig_child_account1, // 1
        env.ALGOTESTNET_mulitsig_child_account2, // 2
        env.ALGOTESTNET_mulitsig_child_account3, // 3
      ],
    }
    const transaction = algoTest.new.Transaction({ multiSigOptions })
    const action = await algoTest.composeAction(ChainActionType.ValueTransfer, valueTransferParams)
    transaction.actions = [action]
    await transaction.prepareToBeSigned()
    await transaction.validate()
    await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_mulitsig_child_account1_PRIVATE_KEY)])
    expect(transaction.missingSignatures).toEqual([
      'N3TSCN6IFKL6MFHOQ4KTNYJWJHSSKBK3PDSVJJBKQSCLB4RCVF37BEVHFU',
      'YIMLLIQHKASYE2I34O7M4JNOQNOHDOMXK7EK3IIFMCNAU3ZMTGCI4E5DE4',
    ])
    await expect(transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_testaccount_PRIVATE_KEY)])).rejects.toThrow(
      'Cant sign multisig transaction the private key of address VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ - it doesnt match an address in multisig options: 5NS7YTBXFPC4IQHDCS4RIKQXGYQJIQVNI2CLRXN7ZJ77BHJGQZNQHO4OBA,N3TSCN6IFKL6MFHOQ4KTNYJWJHSSKBK3PDSVJJBKQSCLB4RCVF37BEVHFU,YIMLLIQHKASYE2I34O7M4JNOQNOHDOMXK7EK3IIFMCNAU3ZMTGCI4E5DE4',
    )
    await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_mulitsig_child_account2_PRIVATE_KEY)])
    expect(transaction.missingSignatures).toEqual(['YIMLLIQHKASYE2I34O7M4JNOQNOHDOMXK7EK3IIFMCNAU3ZMTGCI4E5DE4'])
    await transaction.sign([toAlgorandPrivateKey(env.ALGOTESTNET_mulitsig_child_account3_PRIVATE_KEY)])
    expect(transaction.missingSignatures).toBeNull()
  })

  it('from and multisigOptions mismatch', async () => {
    const valueTransferParams: ValueTransferParams = {
      fromAccountName: toChainEntityName('VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ'),
      toAccountName: toChainEntityName('CXNBI5GZJ3I5IKEUT73SHSTWRUQ3UVAYZBQ5RNLR5CM2LFFL7W7W5433DM'),
      amount: '1',
    }
    const multiSigOptions: AlgorandMultiSigOptions = {
      version: 1,
      threshold: 3,
      addrs: [
        env.ALGOTESTNET_mulitsig_child_account1, // 1
        env.ALGOTESTNET_mulitsig_child_account2, // 2
        env.ALGOTESTNET_mulitsig_child_account3, // 3
      ],
    }
    const multisigAddress = determineMultiSigAddress(multiSigOptions)
    const transaction = algoTest.new.Transaction({ multiSigOptions })
    const action = await algoTest.composeAction(ChainActionType.ValueTransfer, valueTransferParams)
    transaction.actions = [action]
    await transaction.prepareToBeSigned()
    await expect(transaction.validate()).rejects.toThrow(
      `From address (or txn.snd) must be the multisig address (hash of multisig options). Got: ${valueTransferParams.fromAccountName}. Expected: ${multisigAddress}`,
    )
  })
})
