import { ChainFactory, ChainType } from '../../../index'
import { ChainEndpoint } from '../../../models'
import { AlgorandMultiSigOptions } from '../models/generalModels'

require('dotenv').config()

const algoPureStakeTestnet = 'https://testnet-algorand.api.purestake.io/ps1'

export const algoTestnetEndpoints: ChainEndpoint[] = [
  {
    url: new URL(algoPureStakeTestnet),
    settings: {
      token: {
        'X-API-Key': '7n0G2itKl885HQQzEfwtn4SSE1b6X3nb6zVnUw99',
      },
    },
  },
]

export const CreateAccountOptions = {
  newKeysOptions: {
    password: '2233',
  },
}

export const multiSigOptions: AlgorandMultiSigOptions = {
  version: 1,
  threshold: 2,
  accounts: [
    'LE6IM6NPZ7DPF3LTVQT62ARING2VSXO7KOYFHCUCNXKSQLVW4I3AKXUMPI',
    'S4N2Q4H3ZDZHR7OL6C7FLXI76K7W5XTPFNOXHOSUPL7GPMXU4PT4XCHXLE',
    'O24FOKUAML2OB3KLQXWIZ2S4VFTEMO6E2PZFYBDT6HX22C5O7DCRHUIUWU',
  ],
}

export const CreateMultiSigAccountOptions = {
  ...CreateAccountOptions,
  multiSigOptions,
}
;(async () => {
  /** Create Algorand chain instance */
  const algoTest = new ChainFactory().create(ChainType.AlgorandV1, algoTestnetEndpoints)
  await algoTest.connect()
  if (algoTest.isConnected) {
    console.log('Connected to %o', algoPureStakeTestnet)
  }

  /** Create Algorand account */
  const createAccount = algoTest.new.CreateAccount(CreateAccountOptions)
  await createAccount.generateKeysIfNeeded()
  const { accountName, generatedKeys } = createAccount
  console.log('generatedKeys: %o', generatedKeys)
  console.log('account name: %o', accountName)
  const account = await algoTest.new.Account(accountName)
  console.log('account: %o', account.name)

  /** Create Algorand multisig account */
  const createMultiSigAccount = algoTest.new.CreateAccount(CreateMultiSigAccountOptions)
  await createMultiSigAccount.generateKeysIfNeeded()
  const { accountName: multiSigAccountName } = createMultiSigAccount
  console.log('mulitsig account: %o', multiSigAccountName)
})()
