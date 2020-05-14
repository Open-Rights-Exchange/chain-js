import { EosEntityName } from '../../models'

interface createEscrowReclaimParams {
  accountName: EosEntityName
  appName: string
  contractName: EosEntityName
  permission: EosEntityName
  symbol: string
}

export const composeAction = ({ accountName, appName, contractName, permission, symbol }: createEscrowReclaimParams) => ({
  account: contractName,
  name: 'reclaim',
  authorization: [
    {
      actor: accountName,
      permission,
    },
  ],
  data: {
    reclaimer: accountName,
    dapp: appName,
    sym: symbol,
  },
})

export const decomposeAction = (action: any) => {
}