import { isValidAddress as isValidAlgorandAddress } from 'algosdk'

export function isValidAddress(address: string): boolean {
  return isValidAlgorandAddress(address)
}
