/* eslint-disable no-console */
import { toEosDate, toEosAsset, isValidEosEntityName, isValidEosPublicKey, toEosPublicKey } from './helpers'

const eosDate = toEosDate(new Date())
console.log(eosDate)

const eosAsset = toEosAsset(1.1, 'eos')
const eosPublicKey = toEosPublicKey('EOS7Rq5JcGyCGQXbRkmHLDpFTti1ZJFhcvU7HeX2m61wTkoHjJAMJ')
console.log(eosAsset, eosPublicKey)

console.log('EOS Name:', isValidEosEntityName('aaaaaBBBB123'))

console.log('EOS Public Key:', isValidEosPublicKey('EOS7Rq5JcGyCGQXbRkmHLDpFTti1ZJFhcvU7HeX2m61wTkoHjJAMJ'))

// this Constructor approach adds this class's members to another class (a mixin)
// See https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-mix-in-classes
