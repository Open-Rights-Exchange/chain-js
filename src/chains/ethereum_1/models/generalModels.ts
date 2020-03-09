import { ChainEntityNameBrand } from '../../../models'

export type EthereumEntityName = string & ChainEntityNameBrand

export type EthereumNewKeysOptions = {
  password?: string
  salt?: string
}
