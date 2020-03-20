// import { toHex } from 'web3-utils'
import { EthereumActionInput } from '../../models'
import { generateDataFromContractAction, ethereumTrxArgIsNullOrEmpty } from '../../helpers'

export const action = (tokenTransferAction: EthereumActionInput) => {
  const { to, value, contract } = tokenTransferAction
  if (ethereumTrxArgIsNullOrEmpty(value)) {
    const encodedData = generateDataFromContractAction(contract)
    return {
      to: '0x0000000000000000000000000000000000000000',
      value: '0x00',
      data: encodedData,
    }
  }
  return {
    to,
    value,
    data: '0x00',
  }
}
