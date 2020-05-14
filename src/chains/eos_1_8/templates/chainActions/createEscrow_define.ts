/* eslint-disable @typescript-eslint/camelcase */
import { EosPublicKey, EosEntityName } from '../../models'
import { ChainActionType } from '../../../../models'

const actionName = 'define'

interface createEscrowDefineParams {
  accountName: EosEntityName
  activekey: EosPublicKey
  airdrop: createEscrowAirdropParams
  appName: string
  contractName: EosEntityName
  cpu: string
  permission: EosEntityName
  net: string
  pricekey: string
  ram: string
  rex: createEscrowRexParams
  useRex: boolean
}

interface createEscrowAirdropParams {
  contract: EosEntityName
  tokens: string
  limit: string
}

interface createEscrowRexParams {
  netLoanPayment: string
  netLoanFund: string
  cpuLoanPayment: string
  cpuLoanFund: string
}

export const composeAction = ({
  accountName,
  airdrop,
  appName,
  contractName,
  cpu,
  permission,
  net,
  pricekey,
  ram,
  rex: {
    netLoanPayment: net_loan_payment,
    netLoanFund: net_loan_fund,
    cpuLoanPayment: cpu_loan_payment,
    cpuLoanFund: cpu_loan_fund,
  },
  useRex,
}: createEscrowDefineParams) => ({
  account: contractName,
  name: actionName,
  authorization: [
    {
      actor: accountName,
      permission,
    },
  ],
  data: {
    owner: accountName,
    dapp: appName,
    ram_bytes: ram,
    net,
    cpu,
    pricekey,
    airdrop,
    rex: { net_loan_payment, net_loan_fund, cpu_loan_payment, cpu_loan_fund },
    use_rex: useRex,
  },
})

export const decomposeAction = (action: any) => {
  const { name, data } = action

  if (name === actionName && data?.owner && data?.dapp && data?.ram_bytes && data?.net && data?.cpu && data?.pricekey) {
    return {
      actionType: ChainActionType.CreateEscrowDefine,
      args: { ...data },
    }
  }

  return null
}
