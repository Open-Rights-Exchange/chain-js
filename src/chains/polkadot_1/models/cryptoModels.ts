import {
  SignatureBrand,
} from '../../../models'

export interface ECDSASignature {
  v: number
  r: Buffer
  s: Buffer
}

export type PolkadotSignature = ECDSASignature & SignatureBrand
