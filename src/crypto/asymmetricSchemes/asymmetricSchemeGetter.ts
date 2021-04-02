import { AsymmetricSchemeGenerator, AsymmetricScheme } from '../asymmetricModels'
import { asymmetricSchemeSecpk256k1Type1, asymmetricSchemeEd25519Type1 } from './asymmetricSchemeType1'

/** return the generator for the desired scheme */
export function getAsymSchemeGenerator(scheme?: AsymmetricScheme): AsymmetricSchemeGenerator {
  if (scheme === AsymmetricScheme.SECP256K1_TYPE1) return asymmetricSchemeSecpk256k1Type1
  if (
    scheme === AsymmetricScheme.ED25519_TYPE1 ||
    scheme === AsymmetricScheme.ALGORAND_ASYMMETRIC_SCHEME_NAME ||
    scheme === AsymmetricScheme.DEFAULT_ED25519_ASYMMETRIC_SCHEME_NAME
  )
    return asymmetricSchemeEd25519Type1
  // default scheme
  return asymmetricSchemeSecpk256k1Type1
}
