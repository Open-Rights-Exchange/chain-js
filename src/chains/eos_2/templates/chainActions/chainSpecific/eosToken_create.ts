import { EosEntityName, EosDecomposeReturn, EosActionStruct, EosSymbol } from '../../../models'
import { ChainActionType } from '../../../../../models'
import {
  toEosEntityName,
  getFirstAuthorizationIfOnlyOneExists,
  toEosEntityNameOrNull,
  toEosAsset,
  EosAssetHelper,
} from '../../../helpers'

const actionName = 'create'

interface TokenCreateParams {
  contractName: EosEntityName
  ownerAccountName: EosEntityName
  toAccountName: EosEntityName
  amount: number
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
}: TokenCreateParams): EosActionStruct => ({
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
    const returnData: TokenCreateParams = {
      contractName: toEosEntityName(account),
      ownerAccountName: toEosEntityNameOrNull(auth?.actor),
      toAccountName: toEosEntityName(data.issuer),
      permission: toEosEntityNameOrNull(auth?.permission),
      amount: maxSupplyAsset.amount,
      symbol: maxSupplyAsset.symbol,
    }
    const partial = !returnData?.permission || !returnData?.ownerAccountName
    return {
      chainActionType: ChainActionType.TokenCreate,
      args: returnData,
      partial,
    }
  }

  return null
}
