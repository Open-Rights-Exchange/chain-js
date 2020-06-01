/* eslint-disable @typescript-eslint/camelcase */
import { EosChainActionType, EosEntityName, EosActionStruct, EosDecomposeReturn } from '../../models'
import { toEosEntityName, getFirstAuthorizationIfOnlyOneExists, toEosEntityNameOrNull } from '../../helpers'

const actionName = 'define'

interface CreateEscrowDefineParams {
  accountName: EosEntityName
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
}: CreateEscrowDefineParams): EosActionStruct => ({
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

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.owner && data?.dapp && data?.ram_bytes && data?.net && data?.cpu && data?.pricekey) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const returnData: Partial<CreateEscrowDefineParams> = {
      contractName: toEosEntityName(account),
      permission: toEosEntityNameOrNull(auth?.permission),
      accountName: toEosEntityName(data?.owner),
      ram: data?.ram_bytes,
      cpu: data?.cpu,
      net: data?.net,
      pricekey: data?.pricekey,
      appName: data?.dapp,
      airdrop: data?.airdrop,
      rex: {
        netLoanPayment: data?.net_loan_payment,
        netLoanFund: data?.net_loan_fund,
        cpuLoanPayment: data?.cpu_loan_payment,
        cpuLoanFund: data?.cpu_loan_fund,
      },
      useRex: data?.use_rex,
    }
    const partial = !returnData?.permission
    return {
      chainActionType: EosChainActionType.CreateEscrowDefine,
      args: returnData,
      partial,
    }
  }

  return null
}
