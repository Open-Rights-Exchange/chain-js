import { ChainActionType } from '../../models'
import { notSupported } from '../../helpers'
import { composeAction as ValueTransferTemplate } from './templates/chainActions/standard/value_transfer'
import { composeAction as AssetTransferTemplate } from './templates/chainActions/chainSpecific/asset_transfer'
import { AlgorandChainActionType, AlgorandTransactionAction } from './models'
import { AlgorandChainState } from './algoChainState'
import { ALGORAND_TRX_COMFIRMATION_ROUNDS } from './algoConstants'

// map a key name to a function that returns an object
const ComposeAction: { [key: string]: (args: any) => any } = {
  // Standard actions
  ValueTransfer: ValueTransferTemplate,
  // Algorand actions
  AssetTransfer: AssetTransferTemplate,
}

/** Compose an object for a chain contract action */
export async function composeAction(
  chainState: AlgorandChainState,
  chainActionType: ChainActionType | AlgorandChainActionType,
  args: any,
): Promise<AlgorandTransactionAction> {
  const composerFunction = ComposeAction[chainActionType as string]
  if (!composerFunction) {
    notSupported()
  }
  const suggestedParams = await chainState.algoClient.getTransactionParams()
  const { genesishashb64: genesisHash, minFee, lastRound: lastRoundFromChain } = suggestedParams
  const { fee: fixedFee, flatFee = false, firstRound: inputFirstRound, lastRound: inputLastRound } = args
  const fee = flatFee ? fixedFee : minFee
  const firstRound = inputFirstRound || lastRoundFromChain
  const lastRound = inputLastRound || firstRound + ALGORAND_TRX_COMFIRMATION_ROUNDS
  const composeArgs = {
    ...suggestedParams,
    ...args,
    fee,
    genesisHash,
    firstRound,
    lastRound,
  }
  return composerFunction(composeArgs)
}
