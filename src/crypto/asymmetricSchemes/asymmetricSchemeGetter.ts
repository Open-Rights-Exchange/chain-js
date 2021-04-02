import { AsymmetricSchemeGenerator, AsymmetricScheme } from '../asymmetricModels'
import { asymmetricSchemeType1 } from './asymmetricSchemeType1'

/** return the generator for the desired scheme */
export function getAsymSchemeGenerator(scheme?: AsymmetricScheme): AsymmetricSchemeGenerator {
  if (scheme === AsymmetricScheme.SECP256K1_TYPE1) return asymmetricSchemeType1
  // default scheme
  return asymmetricSchemeType1
}
