import { AlgorandChainState } from '../../algoChainState'
import { AlgorandChainEndpoint } from '../../models'

const algoPureStakeTestnet = 'https://testnet-algorand.api.purestake.io/ps2'
const algoPureStakeTestnetIndexer = 'https://testnet-algorand.api.purestake.io/idx2'

export const algoTestnetEndpoints: AlgorandChainEndpoint[] = [
  {
    url: algoPureStakeTestnet,
    options: {
      indexerUrl: algoPureStakeTestnetIndexer,
      headers: [
        {
          'x-api-key': '7n0G2itKl885HQQzEfwtn4SSE1b6X3nb6zVnUw99',
        },
      ],
    },
  },
]

// const algoTest = new ChainFactory().create(ChainType.AlgorandV1, algoTestnetEndpoints)

export class AlgoClient {
  public getTransactionParams() {
    return {
      genesisID: 'testnet-v1.0',
      lastRound: 8323228,
      consensusVersion: 8322229,
      minFee: 266000,
    }
  }
}

export async function getChainState() {
  const chainState = new AlgorandChainState(algoTestnetEndpoints)
  await chainState.connect()
  return chainState
}
