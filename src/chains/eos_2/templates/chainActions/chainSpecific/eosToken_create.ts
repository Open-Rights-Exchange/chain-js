import { EosEntityName, EosDecomposeReturn, EosActionStruct, EosSymbol, EosChainActionType } from '../../../models'
import {
  toEosEntityName,
  getFirstAuthorizationIfOnlyOneExists,
  toEosEntityNameOrNull,
  toEosAsset,
  EosAssetHelper,
} from '../../../helpers'

const actionName = 'create'

export interface EosTokenCreateParams {
  contractName: EosEntityName
  ownerAccountName: EosEntityName
  toAccountName: EosEntityName
  amount: string
  symbol: EosSymbol
  permission: EosEntityName
}

export const composeAction = ({
  contractName,
  ownerAccountName,
  toAccountName,
  amount,
  symbol,
  permission,
}: EosTokenCreateParams): EosActionStruct => ({
  account: contractName,
  name: actionName,
  authorization: [
    {
      actor: ownerAccountName,
      permission,
    },
  ],
  data: {
    issuer: toAccountName,
    // todo: confirm this is an EOS asset and not just a number
    maximum_supply: toEosAsset(amount, symbol),
  },
})

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, account, authorization } = action

  if (name === actionName && data?.issuer && data?.maximum_supply) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const maxSupplyAsset = new EosAssetHelper(null, null, data.maximum_supply)
    const returnData: EosTokenCreateParams = {
      contractName: toEosEntityName(account),
      ownerAccountName: toEosEntityNameOrNull(auth?.actor),
      toAccountName: toEosEntityName(data.issuer),
      permission: toEosEntityNameOrNull(auth?.permission),
      amount: maxSupplyAsset.amount,
      symbol: maxSupplyAsset.symbol,
    }
    const partial = !returnData?.permission || !returnData?.ownerAccountName
    return {
      chainActionType: EosChainActionType.EosTokenCreate,
      args: returnData,
      partial,
    }
  }

  return null
}
