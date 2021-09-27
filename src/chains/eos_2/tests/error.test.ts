/* eslint-disable jest/no-conditional-expect */
// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock
import { JsonRpc, RpcError } from 'eosjs'
import { mapChainError } from '../eosErrors'
import { ChainErrorType } from '../../../models'

describe('Error mapping', () => {
  const endpoint = 'http://localhost'
  const fetchMock = fetch as any
  let jsonRpc: JsonRpc

  beforeEach(() => {
    fetchMock.resetMocks()
    jsonRpc = new JsonRpc(endpoint)
  })

  // sets fetchMock to throw an error on the next call to fetch (jsonRpc.get_abi calls fetch and triggers the error to be thrown)
  it('maps a TxExceededResources error', async () => {
    let actErrorType = null
    const expErrorType = ChainErrorType.TxExceededResources

    const expReturn = {
      message: 'Internal Service Error',
      error: {
        code: 3080002,
        name: 'tx_net_usage_exceeded',
        what: 'Transaction exceeded the current network usage limit imposed on the transaction',
        details: [
          {
            message: 'transaction net usage is too high: 120 > 0',
            file: 'transaction_context.cpp',
            line_number: '462',
            method: 'check_net_usage',
          },
        ],
      },
    }
    fetchMock.once(JSON.stringify(expReturn), { status: 500 })
    try {
      await jsonRpc.get_abi('placeholder')
    } catch (e) {
      // eslint-disable-next-line jest/no-try-expect
      expect(e).toBeInstanceOf(RpcError)
      const mappedError = mapChainError(e)
      actErrorType = mappedError.errorType
    }

    expect(actErrorType).toEqual(expErrorType)
  })

  // sets fetchMock to throw an error on the next call to fetch (jsonRpc.get_abi calls fetch and triggers the error to be thrown)
  it('maps a account does not exist error', async () => {
    let actErrorType = null
    const expErrorType = ChainErrorType.AccountDoesntExist

    const expReturn = {
      message: 'assertion failure with message: to account does not exist',
      error: {
        code: 3050003,
        name: 'eosio_assert_message_exception',
        what: 'eosio_assert_message assertion failure',
        details: [
          {
            message: 'assertion failure with message: to account does not exist',
            file: 'wasm_interface.cpp',
            line_number: '1075',
            method: 'exec_one',
          },
        ],
      },
    }
    fetchMock.once(JSON.stringify(expReturn), { status: 500 })
    try {
      await jsonRpc.get_abi('placeholder')
    } catch (e) {
      // eslint-disable-next-line jest/no-try-expect
      expect(e).toBeInstanceOf(RpcError)
      const mappedError = mapChainError(e)
      actErrorType = mappedError.errorType
    }
    expect(actErrorType).toEqual(expErrorType)
  })
})
