import { EosEntityName } from '../../models'

interface createEscrowInitParams {
  contractName: EosEntityName
  chainSymbol: string
  newAccountContract: EosEntityName
  newAccountAction: string
  minimumRAM: string
  permission: EosEntityName
}

export const action = ({
  contractName,
  chainSymbol,
  newAccountContract,
  newAccountAction,
  minimumRAM,
  permission,
}: createEscrowInitParams) => ({
  account: contractName,
  name: 'init',
  authorization: [
    {
      actor: contractName,
      permission,
    },
  ],
  data: {
    symbol: chainSymbol,
    newaccountcontract: newAccountContract,
    newaccountaction: newAccountAction,
    minimumram: minimumRAM,
  },
})
