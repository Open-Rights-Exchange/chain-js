// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock

import { jsonParseAndRevive, toChainEntityName } from '../../../helpers'
import { ChainFactory, ChainType } from '../../..'
import { determineMultiSigAddress, toAlgorandPrivateKey } from '../helpers'
import { multisigChainSerialized } from './mockups/multisig'
import { AlgorandMultiSigOptions } from '../models'
import { ChainActionType, ValueTransferParams } from '../../../models'

const childAcct1 = 'E4437CMRLC234HAGT4SRYTISZF3XQGZUT33Q27UDW7CDDYLXIXGD4UR7YA'
const childAcct1Private =
  'd981cfed95079eddfabfacf6ae0e25532110ea574ee06879ec7d55d0a627ee372739bf899158b5be1c069f251c4d12c977781b349ef70d7e83b7c431e17745cc'
const childAcct2 = 'DO3QUYQYULI2FZ6TKCLCFMGEXEKPNWXZOWIYROKSLULGJ32DX6UUPY5V2A'
const childAcct2Private =
  '5c9e78cf352176ffc1e73e3a4d0e49039f8f365b36784aaefeb0561e0566f9c61bb70a6218a2d1a2e7d3509622b0c4b914f6daf9759188b9525d1664ef43bfa9'
const childAcct3 = 'UWEZ3SOBO66JAPVPKW43RI4VEIEDVOOVLEF4RWKTDIFFWUDWLEBWJYUARM'
const childAcct3Private =
  '3f4a8e3a6550059561b880365146c727663899b071dadae7754b6296713e5761a5899dc9c177bc903eaf55b9b8a39522083ab9d5590bc8d9531a0a5b50765903'
const multisigAddres = '24JFLJNUGGF6MNIW7SK544WKOOAONT6FTRGV64VODWRNZAJX7OK6GZRLZA'

const wrongPrivate =
  'fe436b04b330c5a85c0ccdb0348e05aa229e8b13e9ff151306cc4731532126c6cb250200cd40fa409e12eed02381b5ad2c53c2756fdc4404ba19206a397b114d'

describe('Test Algorand Multisig Transactions', () => {
  const algoTestnetEndpoints = [
    {
      url: 'https://testnet-algorand.api.purestake.io/ps2',
      options: {
        indexerUrl: 'https://testnet-algorand.api.purestake.io/idx2',
        // API Key is the same with ALGORAND_API_KEY in ore-id-docs .env.example files.
        headers: [{ 'x-api-key': '3bk0oUJKr7aLJlcWnMOqu4OxLcXHaPpk5niyPGHR' }],
      },
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
    await transaction.sign([toAlgorandPrivateKey(childAcct1Private)])
    expect(transaction.missingSignatures).toEqual([childAcct2, childAcct3])
    await transaction.sign([toAlgorandPrivateKey(childAcct2Private)])
    expect(transaction.missingSignatures).toEqual([childAcct3])
    await transaction.sign([toAlgorandPrivateKey(childAcct3Private)])
    expect(transaction.missingSignatures).toBeNull()
  })

  it('set multisig payment action', async () => {
    const valueTransferParams: ValueTransferParams = {
      fromAccountName: toChainEntityName(multisigAddres),
      toAccountName: toChainEntityName('VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ'),
      amount: '1',
    }
    const multiSigOptions: AlgorandMultiSigOptions = {
      version: 1,
      threshold: 3,
      addrs: [
        childAcct1, // 1
        childAcct2, // 2
        childAcct3, // 3
      ],
    }
    const transaction = algoTest.new.Transaction({ multiSigOptions })
    const action = await algoTest.composeAction(ChainActionType.ValueTransfer, valueTransferParams)
    transaction.actions = [action]
    await transaction.prepareToBeSigned()
    await transaction.validate()
    await transaction.sign([toAlgorandPrivateKey(childAcct1Private)])
    expect(transaction.missingSignatures).toEqual([childAcct2, childAcct3])
    await expect(transaction.sign([toAlgorandPrivateKey(wrongPrivate)])).rejects.toThrow(
      'Cant sign multisig transaction the private key of address ZMSQEAGNID5EBHQS53ICHANVVUWFHQTVN7OEIBF2DEQGUOL3CFG6UDHS7U - it doesnt match an address in multisig options: E4437CMRLC234HAGT4SRYTISZF3XQGZUT33Q27UDW7CDDYLXIXGD4UR7YA,DO3QUYQYULI2FZ6TKCLCFMGEXEKPNWXZOWIYROKSLULGJ32DX6UUPY5V2A,UWEZ3SOBO66JAPVPKW43RI4VEIEDVOOVLEF4RWKTDIFFWUDWLEBWJYUARM',
    )
    await transaction.sign([toAlgorandPrivateKey(childAcct2Private)])
    expect(transaction.missingSignatures).toEqual([childAcct3])
    await transaction.sign([toAlgorandPrivateKey(childAcct3Private)])
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
        childAcct1, // 1
        childAcct2, // 2
        childAcct3, // 3
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
