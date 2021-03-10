import * as ModelsCryptoEcc from '../crypto/eccCryptoModels'
import * as ModelsCryptoEd25519 from '../crypto/ed25519CryptoModels'
import * as ModelsCryptoAsymmetric from '../crypto/asymmetricModels'
import * as ModelsCryptoAes from '../crypto/aesCryptoModels'
import * as ModelsCryptoGeneric from '../crypto/genericCryptoModels'

/** Brand signifiying a valid value - assigned by using toPublicKey */
enum PublicKeyBrand {
  _ = '',
}
/** Brand signifiying a valid value - assigned by using toPrivateKey */
enum PrivateKeyBrand {
  _ = '',
}
/** Brand signifiying a valid value - assigned by using toSignature */
enum SignatureBrand {
  _ = '',
}

/** a public key string - formatted correctly for the chain */
// TODO: eth public key is of type buffer
type PublicKey = (string & PublicKeyBrand) | any
/** a private key string - formatted correctly for the chain */
type PrivateKey = (string & PrivateKeyBrand) | any
/** a signature string - formatted correcly for the chain */
type Signature = string & SignatureBrand

type KeyPair = {
  publicKey: PublicKey
  privateKey: PrivateKey
  privateKeyEncrypted?: ModelsCryptoGeneric.EncryptedDataString
}

type AccountKeysStruct = {
  publicKeys: {
    active: PublicKey
  }
  privateKeys: {
    active: PrivateKey | ModelsCryptoGeneric.EncryptedDataString
  }
}

enum CryptoCurve {
  Ed25519 = 'ed25519',
  Secp256k1 = 'secp256k1',
  Sr25519 = 'sr25519',
}

// exporting explicity in order to alias Models.. exports
export {
  AccountKeysStruct,
  CryptoCurve,
  KeyPair,
  ModelsCryptoAes,
  ModelsCryptoAsymmetric,
  ModelsCryptoEcc,
  ModelsCryptoEd25519,
  ModelsCryptoGeneric,
  PrivateKey,
  PrivateKeyBrand,
  PublicKey,
  PublicKeyBrand,
  Signature,
  SignatureBrand,
}
